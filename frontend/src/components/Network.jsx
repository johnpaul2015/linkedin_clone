import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

function Network() {
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [sentRequestIds, setSentRequestIds] = useState(new Set());

  // Search & Pagination State
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Status & UI State
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("access");

  // Handle Auth failure
  const handleAuthError = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }, [navigate]);

  // 1. Fetch Users (Discover)
  const fetchUsers = useCallback(
    async (searchTerm = "", pageNum = 1) => {
      if (!token) return handleAuthError();
      setLoadingUsers(true);
      setErrorMsg("");

      try {
        const queryParams = new URLSearchParams();
        if (searchTerm.trim()) {
          queryParams.append("search", searchTerm.trim());
        }
        if (pageNum > 1) {
          queryParams.append("page", pageNum);
        }

        const url = `${API_BASE}/users/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          return handleAuthError();
        }

        if (res.ok) {
          const data = await res.json();
          // Backend returns standard DRF paginated structure: { count, next, previous, results }
          setUsers(data.results || []);
          setTotalUserCount(data.count || 0);
          setHasNextPage(Boolean(data.next));
          setHasPrevPage(Boolean(data.previous));
        } else {
          setErrorMsg("Failed to load user suggestions.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setErrorMsg("Network error: Could not reach the server.");
      } finally {
        setLoadingUsers(false);
      }
    },
    [token, handleAuthError]
  );

  // 2. Fetch Incoming Connection Requests
  const fetchInvitations = useCallback(async () => {
    if (!token) return handleAuthError();
    setLoadingInvitations(true);

    try {
      const res = await fetch(`${API_BASE}/connections/requests/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        return handleAuthError();
      }

      if (res.ok) {
        const data = await res.json();
        // Support both paginated { results: [...] } and flat array [...]
        const list = Array.isArray(data) ? data : data.results || [];
        setInvitations(list);
      } else {
        console.warn("Failed to fetch pending requests");
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    } finally {
      setLoadingInvitations(false);
    }
  }, [token, handleAuthError]);

  // 3. Fetch Accepted Connections
  const fetchConnections = useCallback(async () => {
    if (!token) return handleAuthError();
    setLoadingConnections(true);

    try {
      const res = await fetch(`${API_BASE}/connections/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        return handleAuthError();
      }

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setConnections(list);
      } else {
        console.warn("Failed to fetch connections");
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  }, [token, handleAuthError]);

  // Initial Load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers(activeSearch, page);
    fetchInvitations();
    fetchConnections();
  }, [token, navigate, fetchUsers, fetchInvitations, fetchConnections, activeSearch, page]);

  // Action: Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    setPage(1);
  };

  // Action: Send Connection Request
  const handleConnect = async (targetUserId, targetUsername) => {
    if (!token) return handleAuthError();
    setActionLoading((prev) => ({ ...prev, [`connect_${targetUserId}`]: true }));
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/connections/request/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiver_id: targetUserId }),
      });

      if (res.status === 401) return handleAuthError();

      if (res.status === 201) {
        setSentRequestIds((prev) => new Set(prev).add(targetUserId));
        setSuccessMsg(`Connection request sent to ${targetUsername || "user"}!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        const message =
          errData.detail ||
          errData.receiver_id ||
          (Array.isArray(errData) ? errData[0] : null) ||
          "Could not send connection request.";
        setErrorMsg(typeof message === "string" ? message : JSON.stringify(message));
      }
    } catch (err) {
      console.error("Connect error:", err);
      setErrorMsg("Failed to connect. Please check your network.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`connect_${targetUserId}`]: false }));
    }
  };

  // Action: Accept Connection Request
  const handleAccept = async (requestId, senderName) => {
    if (!token) return handleAuthError();
    setActionLoading((prev) => ({ ...prev, [`accept_${requestId}`]: true }));
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/connections/requests/${requestId}/accept/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) return handleAuthError();

      if (res.ok) {
        // Optimistically remove from invitations
        setInvitations((prev) => prev.filter((item) => item.id !== requestId));
        setSuccessMsg(`You are now connected with ${senderName || "user"}!`);
        // Refresh connections list
        fetchConnections();
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Failed to accept connection request.");
      }
    } catch (err) {
      console.error("Accept error:", err);
      setErrorMsg("Failed to accept request. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`accept_${requestId}`]: false }));
    }
  };

  // Action: Ignore / Reject Connection Request
  const handleIgnore = async (requestId) => {
    if (!token) return handleAuthError();
    setActionLoading((prev) => ({ ...prev, [`ignore_${requestId}`]: true }));
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/connections/requests/${requestId}/reject/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) return handleAuthError();

      if (res.ok) {
        setInvitations((prev) => prev.filter((item) => item.id !== requestId));
        setSuccessMsg("Invitation ignored.");
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Failed to ignore connection request.");
      }
    } catch (err) {
      console.error("Ignore error:", err);
      setErrorMsg("Failed to ignore request. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`ignore_${requestId}`]: false }));
    }
  };

  // Action: Remove Existing Connection
  const handleRemoveConnection = async (connectionId, otherUserName) => {
    if (!token) return handleAuthError();
    if (!window.confirm(`Are you sure you want to remove your connection with ${otherUserName || "this user"}?`)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`remove_${connectionId}`]: true }));
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/connections/${connectionId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) return handleAuthError();

      if (res.ok) {
        setConnections((prev) => prev.filter((item) => item.id !== connectionId));
        setSuccessMsg("Connection removed successfully.");
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Failed to remove connection.");
      }
    } catch (err) {
      console.error("Remove error:", err);
      setErrorMsg("Failed to remove connection. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`remove_${connectionId}`]: false }));
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  // Set of connected user IDs for quick lookup
  const connectedUserIds = new Set(
    connections.map((c) => c.connected_user?.id).filter(Boolean)
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* 1. TOP NAVBAR (Consistent with Dashboard) */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-2xl font-bold tracking-tight text-[#0A66C2]"
              >
                Connectly
              </Link>
            </div>

            {/* Middle: Navigation Links */}
            <nav className="flex items-center space-x-1 sm:space-x-6 text-sm font-medium">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-[#0A66C2] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </Link>

              <Link
                to="/network"
                className="flex items-center gap-1.5 px-3 py-2 text-[#0A66C2] border-b-2 border-[#0A66C2]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="hidden sm:inline">My Network</span>
                {invitations.length > 0 && (
                  <span className="ml-1 bg-[#0A66C2] text-white text-xs px-1.5 py-0.2 rounded-full font-bold">
                    {invitations.length}
                  </span>
                )}
              </Link>

              <Link
                to="/profile-setup"
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-[#0A66C2] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden sm:inline">My Profile</span>
              </Link>
            </nav>

            {/* Right: Logout Action */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs sm:text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 px-3.5 py-1.5 rounded-full transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg("")}
              className="font-bold ml-2 text-red-500 hover:text-red-800"
            >
              &times;
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center justify-between">
            <span>{successMsg}</span>
            <button
              onClick={() => setSuccessMsg("")}
              className="font-bold ml-2 text-green-500 hover:text-green-800"
            >
              &times;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR: Network Summary (3 cols) */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Manage my network
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center justify-between text-gray-700">
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Connections
                  </span>
                  <span className="font-semibold text-gray-900">
                    {connections.length}
                  </span>
                </li>
                <li className="flex items-center justify-between text-gray-700">
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Invitations
                  </span>
                  <span className="font-semibold text-[#0A66C2]">
                    {invitations.length}
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick networking tips */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-xs text-gray-500 space-y-2">
              <h3 className="font-semibold text-gray-800">
                Grow Your Professional Circle
              </h3>
              <p className="leading-relaxed">
                Connect with colleagues, alumni, and industry peers to discover new opportunities, exchange insights, and collaborate.
              </p>
            </div>
          </aside>

          {/* MAIN COLUMN: Search, Invitations, Discover, Connections (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* SEARCH BAR CARD */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search professionals by name, headline, or location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A66C2] text-white text-sm font-semibold rounded-lg hover:bg-[#084e96] transition-colors"
                >
                  Search
                </button>
                {activeSearch && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </form>
              {activeSearch && (
                <p className="mt-2 text-xs text-gray-500">
                  Showing results for: <span className="font-semibold text-gray-700">&ldquo;{activeSearch}&rdquo;</span> ({totalUserCount} found)
                </p>
              )}
            </div>

            {/* INCOMING INVITATIONS SECTION */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Invitations ({invitations.length})
                </h2>
              </div>

              {loadingInvitations ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Loading invitations...
                </div>
              ) : invitations.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No pending invitations at this time.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {invitations.map((inv) => {
                    const sender = inv.sender || {};
                    const profile = sender.profile || {};
                    const initial = sender.username
                      ? sender.username.charAt(0).toUpperCase()
                      : "U";
                    const isProcessing =
                      actionLoading[`accept_${inv.id}`] ||
                      actionLoading[`ignore_${inv.id}`];

                    return (
                      <div
                        key={inv.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0A66C2] font-bold text-lg flex items-center justify-center shrink-0 border border-blue-200">
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {sender.first_name && sender.last_name
                                ? `${sender.first_name} ${sender.last_name}`
                                : sender.username}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {profile.headline || "Connectly Member"}
                            </p>
                            {profile.location && (
                              <p className="text-xs text-gray-400">
                                {profile.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleIgnore(inv.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-full transition-colors disabled:opacity-50"
                          >
                            Ignore
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              handleAccept(
                                inv.id,
                                sender.first_name || sender.username
                              )
                            }
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#084e96] rounded-full transition-colors disabled:opacity-50"
                          >
                            {actionLoading[`accept_${inv.id}`]
                              ? "Accepting..."
                              : "Accept"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PEOPLE YOU MAY KNOW (DISCOVER USERS) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  People You May Know
                </h2>
                <span className="text-xs text-gray-500">
                  {totalUserCount} registered professionals
                </span>
              </div>

              {loadingUsers ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading suggestions...
                </div>
              ) : users.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No professionals found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {users.map((person) => {
                    const profile = person.profile || {};
                    const initial = person.username
                      ? person.username.charAt(0).toUpperCase()
                      : "U";
                    const isConnected = connectedUserIds.has(person.id);
                    const isSent = sentRequestIds.has(person.id);
                    const isConnecting = actionLoading[`connect_${person.id}`];

                    return (
                      <div
                        key={person.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow"
                      >
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-[#0A66C2] font-bold text-xl flex items-center justify-center border-2 border-blue-200 mb-3">
                          {initial}
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {person.first_name && person.last_name
                            ? `${person.first_name} ${person.last_name}`
                            : person.username}
                        </h3>

                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[32px]">
                          {profile.headline || "Connectly Professional"}
                        </p>

                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 min-h-[16px]">
                          {profile.location || "\u00A0"}
                        </p>

                        <div className="mt-4 w-full pt-3 border-t border-gray-100">
                          {isConnected ? (
                            <span className="inline-block w-full text-center py-1.5 px-3 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full cursor-default">
                              Connected
                            </span>
                          ) : isSent ? (
                            <span className="inline-block w-full text-center py-1.5 px-3 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full cursor-default">
                              Pending
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isConnecting}
                              onClick={() =>
                                handleConnect(
                                  person.id,
                                  person.first_name || person.username
                                )
                              }
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 text-xs font-semibold rounded-full transition-colors disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span>{isConnecting ? "Sending..." : "Connect"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              {totalUserCount > 10 && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <button
                    type="button"
                    disabled={!hasPrevPage || loadingUsers}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    &larr; Previous
                  </button>

                  <span>
                    Page {page} of {Math.max(1, Math.ceil(totalUserCount / 10))}
                  </span>

                  <button
                    type="button"
                    disabled={!hasNextPage || loadingUsers}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* EXISTING CONNECTIONS SECTION */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Your Connections ({connections.length})
                </h2>
              </div>

              {loadingConnections ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Loading connections...
                </div>
              ) : connections.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  You have not connected with any professionals yet. Click &ldquo;Connect&rdquo; on people you know above to get started!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {connections.map((conn) => {
                    const peer = conn.connected_user || {};
                    const profile = peer.profile || {};
                    const initial = peer.username
                      ? peer.username.charAt(0).toUpperCase()
                      : "U";
                    const isRemoving = actionLoading[`remove_${conn.id}`];

                    return (
                      <div
                        key={conn.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0A66C2] font-bold text-lg flex items-center justify-center shrink-0 border border-blue-200">
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {peer.first_name && peer.last_name
                                ? `${peer.first_name} ${peer.last_name}`
                                : peer.username}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {profile.headline || "Connectly Member"}
                            </p>
                            {profile.location && (
                              <p className="text-xs text-gray-400">
                                {profile.location}
                              </p>
                            )}
                            {conn.created_at && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Connected {new Date(conn.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="self-end sm:self-center">
                          <button
                            type="button"
                            disabled={isRemoving}
                            onClick={() =>
                              handleRemoveConnection(
                                conn.id,
                                peer.first_name || peer.username
                              )
                            }
                            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full transition-colors disabled:opacity-50"
                          >
                            {isRemoving ? "Removing..." : "Remove Connection"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Network;

