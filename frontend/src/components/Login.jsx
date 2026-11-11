import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "Invalid email or password.";
        if (typeof data === "object" && data !== null) {
          msg = Object.values(data).flat().join(" ");
        }
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      // Store tokens exactly as currently implemented
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Check whether user already has a profile via /api/profiles/me/
      try {
        const profileRes = await fetch(`${API_BASE}/api/profiles/me/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // If response is an empty array, navigate to profile setup
          if (Array.isArray(profileData) && profileData.length === 0) {
            navigate("/profile-setup");
          } else {
            // User already has a profile, navigate to dashboard
            navigate("/dashboard");
          }
        } else {
          // If profile check returns an error status, keep tokens and navigate to dashboard
          navigate("/dashboard");
        }
      } catch (profileErr) {
        // If network issue during profile check, keep tokens and navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Top Logo */}
      <div className="mb-6 text-center">
        <Link
          to="/"
          className="text-3xl font-bold tracking-tight text-[#0A66C2]"
        >
          Connectly
        </Link>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">
          Log in to continue to Connectly.
        </p>

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmitHandler}>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
              name="email"
              value={form.email}
              onChange={handleOnChange}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
              name="password"
              value={form.password}
              onChange={handleOnChange}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A66C2] hover:bg-[#084e96] disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-full transition-colors shadow-sm text-sm"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#0A66C2] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Return to Home Link */}
      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}

export default Login;
