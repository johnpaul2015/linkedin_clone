import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo / Name */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight text-[#0A66C2]">
              Connectly
            </Link>
          </div>

          {/* Middle: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-gray-600 hover:text-[#0A66C2] text-sm font-medium transition-colors"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-[#0A66C2] text-sm font-medium transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-[#0A66C2] text-sm font-medium transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Right: Auth Actions */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-[#0A66C2] text-sm font-medium px-3 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#0A66C2] hover:bg-[#084e96] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
