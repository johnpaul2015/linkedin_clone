import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'

const API_URL = "http://localhost:8000/api";

function Login() {

  const nav = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleOnChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error!");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      alert("Successfully logged in!");
      setForm({email: "", password: ""}); // resetting the form values.
      nav('/testpage'); // redirect to the '/testpage' after successfully logging in.
    } catch (err) {
      alert(err);
    }
  }
  
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
              onChange={handleOnChange}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#0A66C2] hover:bg-[#084e96] text-white font-medium py-3 px-4 rounded-full transition-colors shadow-sm text-sm"
          >
            Login
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
  )
}

export default Login
