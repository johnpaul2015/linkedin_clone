import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "Registration failed.";
        if (typeof data === "object" && data !== null) {
          msg = Object.values(data).flat().join(" ");
        }
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      setForm({ username: "", email: "", password: "", confirmPassword: "" });
      setSuccessMsg("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setErrorMsg("Failed to connect to the server. Please try again.");
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

      {/* Centered Registration Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Join Connectly and grow your professional network.
        </p>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg text-center">
            {successMsg}
          </div>
        )}

        {/* Registration Form */}
        <form className="mt-6 space-y-4" onSubmit={handleOnSubmit}>
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
              name="username"
              value={form.username}
              onChange={handleOnChange}
            />
          </div>

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

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleOnChange}
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading || Boolean(successMsg)}
            className="w-full bg-[#0A66C2] hover:bg-[#084e96] disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-full transition-colors shadow-sm text-sm"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Log In Redirect Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#0A66C2] font-medium hover:underline"
          >
            Log in
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

export default Register;
