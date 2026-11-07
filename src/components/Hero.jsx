function Hero() {
  return (
    <section id="home" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Heading, Description, and Action Buttons */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Connect with people.{' '}
              <span className="text-[#0A66C2]">
                Build your professional network.
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Connectly helps you connect with professionals, share your
              thoughts, and build meaningful connections.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#"
                className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-medium px-6 py-3 rounded-full transition-colors shadow-sm"
              >
                Get Started
              </a>
              <a
                href="#about"
                className="border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-full transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Column: Professional Networking Visual */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <svg
                viewBox="0 0 400 300"
                className="w-full h-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background decorative circles */}
                <circle cx="200" cy="150" r="110" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 6" />
                <circle cx="200" cy="150" r="60" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />

                {/* Connection lines */}
                <line x1="200" y1="150" x2="100" y2="90" stroke="#0A66C2" strokeWidth="2" />
                <line x1="200" y1="150" x2="300" y2="90" stroke="#0A66C2" strokeWidth="2" />
                <line x1="200" y1="150" x2="90" y2="220" stroke="#0A66C2" strokeWidth="2" />
                <line x1="200" y1="150" x2="310" y2="210" stroke="#0A66C2" strokeWidth="2" />

                {/* Center Node: Connectly Hub */}
                <circle cx="200" cy="150" r="32" fill="#0A66C2" />
                <circle cx="200" cy="140" r="11" fill="white" />
                <path d="M182 165 C182 154 218 154 218 165" fill="white" />

                {/* Top-Left Node */}
                <circle cx="100" cy="90" r="24" fill="white" stroke="#0A66C2" strokeWidth="2" />
                <circle cx="100" cy="83" r="8" fill="#0A66C2" />
                <path d="M88 102 C88 94 112 94 112 102" fill="#0A66C2" />

                {/* Top-Right Node */}
                <circle cx="300" cy="90" r="24" fill="white" stroke="#0A66C2" strokeWidth="2" />
                <circle cx="300" cy="83" r="8" fill="#0A66C2" />
                <path d="M288 102 C288 94 312 94 312 102" fill="#0A66C2" />

                {/* Bottom-Left Node */}
                <circle cx="90" cy="220" r="22" fill="white" stroke="#0A66C2" strokeWidth="2" />
                <circle cx="90" cy="214" r="7" fill="#0A66C2" />
                <path d="M79 231 C79 224 101 224 101 231" fill="#0A66C2" />

                {/* Bottom-Right Node */}
                <circle cx="310" cy="210" r="22" fill="white" stroke="#0A66C2" strokeWidth="2" />
                <circle cx="310" cy="204" r="7" fill="#0A66C2" />
                <path d="M299 221 C299 214 321 214 321 221" fill="#0A66C2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
