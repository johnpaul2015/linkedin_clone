function Contact() {
  return (
    <section id="contact" className="bg-white py-16 md:py-24 border-t border-gray-200">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Description */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Get in <span className="text-[#0A66C2]">Touch</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Have questions or suggestions? We'd love to hear from you.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Email us directly at{' '}
            <a
              href="mailto:support@connectly.com"
              className="text-[#0A66C2] font-medium hover:underline"
            >
              support@connectly.com
            </a>
          </p>
        </div>

        {/* Contact Form */}
        <form className="mt-8 space-y-5 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
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
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
            />
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="4"
              placeholder="Write your message here..."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#0A66C2] hover:bg-[#084e96] text-white font-medium py-3 px-4 rounded-full transition-colors shadow-sm text-sm"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
