import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch user account data (username, email)
        const userRes = await fetch(`${API_BASE}/api/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else if (userRes.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          navigate("/login");
          return;
        }

        // 2. Fetch professional profile details
        const profileRes = await fetch(`${API_BASE}/api/profiles/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (Array.isArray(profileData) && profileData.length > 0) {
            setProfile(profileData[0]);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* 1. TOP NAVBAR */}
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
                className="flex items-center gap-1.5 px-3 py-2 text-[#0A66C2] border-b-2 border-[#0A66C2]"
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="hidden sm:inline">My Network</span>
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

      {/* MAIN THREE-COLUMN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 2. LEFT COLUMN: User Profile Card */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Cover Banner */}
              <div className="h-16 bg-[#0A66C2]"></div>

              {/* Profile Details */}
              <div className="p-4 pt-0 text-center">
                {/* Profile Picture Placeholder */}
                <div className="-mt-8 inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-white bg-blue-100 text-[#0A66C2] font-bold text-xl shadow-sm">
                  {userInitial}
                </div>

                {/* Name / Username */}
                <h2 className="mt-2 text-base font-bold text-gray-900">
                  {user ? user.username : "Connecting..."}
                </h2>

                {/* Professional Headline */}
                <p className="mt-1 text-xs text-gray-600 leading-normal">
                  {profile?.headline ? (
                    profile.headline
                  ) : (
                    <span className="italic text-gray-400">
                      No headline added yet
                    </span>
                  )}
                </p>

                {/* Location */}
                {profile?.location && (
                  <p className="mt-1 text-xs text-gray-500">
                    {profile.location}
                  </p>
                )}

                {/* Profile Completion Status */}
                <div className="mt-4 pt-3 border-t border-gray-100 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Profile Status</span>
                    {profile ? (
                      <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        Complete
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Incomplete
                      </span>
                    )}
                  </div>

                  {!profile && (
                    <Link
                      to="/profile-setup"
                      className="mt-3 block text-center w-full py-1.5 px-3 bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-medium rounded-full transition-colors shadow-sm"
                    >
                      Complete Profile
                    </Link>
                  )}

                  {profile && (
                    <Link
                      to="/profile-setup"
                      className="mt-3 block text-center text-xs font-medium text-[#0A66C2] hover:underline"
                    >
                      Review Profile Info
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-xs text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800">Quick Navigation</p>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/profile-setup" className="hover:text-[#0A66C2]">
                    Profile Onboarding
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-[#0A66C2]">
                    Connectly Landing Page
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          {/* 3. CENTRE COLUMN: Create Post & Feed */}
          <section className="lg:col-span-6 space-y-4">
            {/* Create Post Card (UI Placeholder) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0A66C2] font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <button
                  type="button"
                  className="w-full text-left py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-500 transition-colors"
                >
                  Start a post...
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-around text-xs font-medium text-gray-600">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-not-allowed text-gray-500"
                >
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Media
                </button>

                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-not-allowed text-gray-500"
                >
                  <svg
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Event
                </button>

                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-not-allowed text-gray-500"
                >
                  <svg
                    className="w-4 h-4 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Article
                </button>
              </div>
            </div>

            {/* Feed Section: Friendly Empty State */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#0A66C2] flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-900">
                Your Feed is Ready
              </h3>
              <p className="mt-1 text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                When you or professionals in your network publish posts and insights,
                they will show up right here.
              </p>
              <div className="mt-4 inline-block bg-gray-50 border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full">
                Feed and post APIs are currently in active development
              </div>
            </div>
          </section>

          {/* 4. RIGHT COLUMN: People You May Know & Connectly Info */}
          <aside className="lg:col-span-3 space-y-4">
            {/* People You May Know (Clean Empty State) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900">
                People You May Know
              </h3>
              <div className="mt-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
                <svg
                  className="w-8 h-8 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <p className="mt-2 text-xs font-medium text-gray-700">
                  No suggestions available
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Discover professionals and manage your network.
                </p>
                <Link
                  to="/network"
                  className="mt-3 inline-block text-xs font-semibold text-[#0A66C2] hover:underline"
                >
                  Go to My Network &rarr;
                </Link>
              </div>
            </div>

            {/* Connectly Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-xs text-gray-500 space-y-2">
              <div className="font-semibold text-gray-800 flex items-center gap-1">
                <span>Connectly</span>
                <span className="text-[#0A66C2]">Professional Network</span>
              </div>
              <p className="leading-relaxed">
                Building meaningful professional connections, discussions, and career journeys.
              </p>
              <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-x-3 gap-y-1 text-gray-400">
                <span>About</span>
                <span>Accessibility</span>
                <span>Privacy & Terms</span>
              </div>
              <p className="pt-1 text-gray-400">
                &copy; 2026 Connectly. All rights reserved.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
