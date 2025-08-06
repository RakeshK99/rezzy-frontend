'use client'

import Link from 'next/link';
import { Button } from '@/components/Button';
import { useUser, useClerk } from '@clerk/nextjs';

export default function Hero() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center flex-col text-center bg-black text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced 3D Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Morphing Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse morphing-bg"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000 morphing-bg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500 morphing-bg"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/40 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-float delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400/40 rounded-full animate-float delay-3000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Enhanced Title with 3D Effects - Fixed Text Overflow */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight px-2">
            <span className="block">Perfect Your Resume</span>
            <span className="block mt-2 sm:mt-4">
              with{' '}
              <span className="gradient-text-animated bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Rezzy
              </span>
            </span>
          </h1>
        </div>
        
        {/* Enhanced Description with Glass Effect */}
        <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 mx-4">
          <p className="text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto text-gray-300 leading-relaxed">
            Instantly improve your resume using AI. Tailor it to jobs, pass ATS scans, and get interview-ready — in seconds.
          </p>
        </div>
        
        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button 
                variant="default" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl pulse-glow w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Button 
              variant="default" 
              size="lg"
              onClick={() => openSignIn({ redirectUrl: '/dashboard' })}
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl pulse-glow w-full sm:w-auto"
            >
              Try Free
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={scrollToFeatures}
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-600 hover:border-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            Learn More
          </Button>
        </div>

        {/* Enhanced Stats with 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 px-4">
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 gradient-text-animated">95%</div>
            <div className="text-sm sm:text-base text-gray-400">ATS Pass Rate</div>
          </div>
          
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 gradient-text-animated">2x</div>
            <div className="text-sm sm:text-base text-gray-400">More Interviews</div>
          </div>
          
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 gradient-text-animated">30s</div>
            <div className="text-sm sm:text-base text-gray-400">Resume Analysis</div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="glass-effect-dark backdrop-blur-sm rounded-full p-3 border border-gray-800/50 shadow-lg">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-gradient-to-b from-gray-400 to-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
