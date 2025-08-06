'use client';

export default function Features() {
  return (
    <section className="bg-black py-32 px-4 relative overflow-hidden" id="features">
      {/* Enhanced 3D Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse morphing-bg"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-pink-500/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000 morphing-bg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500 morphing-bg"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/30 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400/30 rounded-full animate-float delay-3000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 gradient-text-animated bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Why Rezzy?
          </h2>
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Transform your job search with AI-powered resume optimization that gets results.
            </p>
          </div>
        </div>
        
        <div className="grid gap-12 md:grid-cols-3">
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d group">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 gradient-text-animated">Tailored to Every Job</h3>
            <p className="text-gray-400 leading-relaxed">
              AI analyzes job descriptions and matches your resume automatically, ensuring perfect alignment with each position.
            </p>
          </div>
          
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d group">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 gradient-text-animated">ATS-Optimized</h3>
            <p className="text-gray-400 leading-relaxed">
              Pass applicant tracking systems confidently with optimized formatting and strategic keyword placement.
            </p>
          </div>
          
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d group">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 gradient-text-animated">Instant Edits</h3>
            <p className="text-gray-400 leading-relaxed">
              One-click improvements with detailed suggestions that transform your resume in seconds, not hours.
            </p>
          </div>
        </div>

        {/* Additional features section */}
        <div className="mt-32 grid gap-12 md:grid-cols-2">
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-12 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 gradient-text-animated">Smart Analytics</h3>
            <p className="text-gray-400 mb-6">
              Track your resume performance with detailed analytics and insights to continuously improve your job search strategy.
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Performance tracking
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Keyword optimization
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Interview success rate
              </li>
            </ul>
          </div>

          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-12 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 gradient-text-animated">Enterprise Security</h3>
            <p className="text-gray-400 mb-6">
              Your data is protected with enterprise-grade security and privacy controls, ensuring your information stays safe.
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                End-to-end encryption
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                GDPR compliant
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                SOC 2 certified
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
