function Footer() {
  return (
    <footer className="bg-[#071b33] text-white py-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <a href="#home" className="inline-block text-2xl font-bold tracking-tight text-white">
              Connect<span className="text-[#0A66C2]">ly</span>
            </a>
            <p className="mt-1 text-sm text-gray-300">
              Building meaningful professional connections.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <a
              href="#home"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-gray-700/60 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 Connectly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
