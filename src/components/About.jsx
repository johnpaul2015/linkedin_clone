function About() {
  return (
    <section id="about" className="bg-gray-50 py-16 md:py-24 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Description */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            About <span className="text-[#0A66C2]">Connectly</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            Connectly is a platform for professionals to connect, share posts,
            and build their professional network.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Connect with Professionals
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Find and connect with other users.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Share Your Ideas
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Share posts and interact with others.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Build Your Network
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Grow your professional connections.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

