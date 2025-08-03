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
    <section className="w-full min-h-screen flex items-center justify-center flex-col text-center bg-black text-white px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 leading-tight">
          Perfect Your Resume with{' '}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Rezzy
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl max-w-3xl mx-auto mb-12 text-gray-300 leading-relaxed">
          Instantly improve your resume using AI. Tailor it to jobs, pass ATS scans, and get interview-ready — in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button variant="default" size="lg" className="text-lg px-8 py-4">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Button 
              variant="default" 
              size="lg"
              onClick={() => openSignIn({ redirectUrl: '/dashboard' })}
              className="text-lg px-8 py-4"
            >
              Try Free
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={scrollToFeatures}
            className="text-lg px-8 py-4"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">95%</div>
            <div className="text-gray-400">ATS Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">2x</div>
            <div className="text-gray-400">More Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">30s</div>
            <div className="text-gray-400">Resume Analysis</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
