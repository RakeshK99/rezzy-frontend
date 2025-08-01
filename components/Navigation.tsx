'use client'

import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/Button';

export default function Navigation() {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn } = useClerk();

  const handleSignOut = () => {
    signOut(() => {
      window.location.href = '/';
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-white hover:text-pink-500 transition-colors">
              Rezzy
            </Link>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <span className="text-gray-300 text-sm hidden sm:block">
                  Welcome, {user?.firstName}
                </span>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openSignIn()}
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => openSignIn({ redirectUrl: '/dashboard' })}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 