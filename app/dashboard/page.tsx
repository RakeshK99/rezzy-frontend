'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/Button';
import Profile from '@/components/Profile';
import JobMatcher from '@/components/JobMatcher';
import JobTracker from '@/components/JobTracker';
import InterviewPrep from '@/components/InterviewPrep';
import SubscriptionManager from '@/components/SubscriptionManager';
import Onboarding from '@/components/Onboarding';
import JobRecommendations from '@/components/JobRecommendations';

interface UsageData {
  scans_used: number;
  month: string;
  cover_letters_generated?: number;
  interview_questions_generated?: number;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [plan, setPlan] = useState<'free' | 'starter' | 'premium' | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [error, setError] = useState('');
  const [userCreated, setUserCreated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    email: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    plan: string;
    position_level?: string;
    job_category?: string;
    current_resume?: {
      id: number;
      filename: string;
      original_filename: string;
      created_at: string;
    };
    created_at: string;
    updated_at: string;
  } | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'jobs' | 'tracker' | 'interview' | 'subscription'>('overview');

  const createUserIfNeeded = useCallback(async () => {
    try {
      console.log('Creating/getting user for:', user?.id);
      
      // Check if backend is available first
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grateful-transformation-production.up.railway.app';
      try {
        const healthCheck = await fetch(`${apiUrl}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        if (!healthCheck.ok) {
          throw new Error('Backend health check failed');
        }
      } catch (healthError) {
        console.warn('Backend not available, will retry later:', healthError);
        setError('Backend service is starting up. Please wait a moment and refresh the page.');
        return;
      }
      
      // Always try to create user first (the backend will handle duplicates)
      console.log('Creating user...');
      const createResponse = await fetch(`${apiUrl}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.id || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
          first_name: user?.firstName || '',
          middle_name: '',
          last_name: user?.lastName || ''
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('Create user response:', createResponse.status);
      
      if (createResponse.ok) {
        console.log('User created/updated successfully');
        
        // Get the user plan first
        const planResponse = await fetch(`${apiUrl}/api/get-plan?user_id=${user?.id}`, {
          signal: AbortSignal.timeout(5000)
        });
        if (planResponse.ok) {
          const planData = await planResponse.json();
          console.log('User plan data:', planData);
          setPlan(planData.plan);
          setUsage(planData.usage);
          setUserCreated(true);
          setError(''); // Clear any previous errors
          
          // Now try to get user profile to check if onboarding is needed
          try {
            const profileResponse = await fetch(`${apiUrl}/api/user-profile/${user?.id}`, {
              signal: AbortSignal.timeout(5000)
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUserProfile(profileData);
              
              // Check if user needs onboarding (no position level or job category set)
              if (!profileData.position_level || !profileData.job_category) {
                setShowOnboarding(true);
              }
            } else {
              // If profile not found, user needs onboarding
              setShowOnboarding(true);
            }
          } catch (profileError) {
            console.warn('Profile fetch failed, showing onboarding:', profileError);
            setShowOnboarding(true);
          }
        } else {
          console.error('Failed to get plan data');
          setError('Failed to load user plan data.');
        }
      } else {
        const errorData = await createResponse.json();
        console.error('Failed to create user:', errorData);
        setError('Failed to create user account. Please try refreshing the page.');
      }
    } catch (_error) {
      console.error('Error creating/getting user:', _error);
      if (_error instanceof Error && _error.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to connect to backend service. Please ensure the backend is running.');
      }
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user?.id && !userCreated) {
      createUserIfNeeded();
    }
  }, [isLoaded, user, userCreated, createUserIfNeeded]);

  const handleSignOut = () => {
    signOut();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh user profile data
    createUserIfNeeded();
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!userCreated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Setting up your account...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Connection Issue</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setError('');
                setUserCreated(false);
                createUserIfNeeded();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Connection
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative border-b border-gray-800/50 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-white hover:text-pink-500 transition-colors">
                Rezzy
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="/#pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user.firstName}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan === 'free' ? 'bg-blue-500/20 text-blue-400' :
                  plan === 'starter' ? 'bg-green-500/20 text-green-400' :
                  plan === 'premium' ? 'bg-pink-500/20 text-pink-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {plan} plan
                </span>
                <span className="text-gray-400 text-sm">
                  {usage?.scans_used || 0}/{plan === 'free' ? '5' : '∞'} scans used
                </span>
              </div>
              
              {/* Profile Icon */}
              <div className="relative">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl pulse-glow"
                >
                  {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Tab Navigation */}
        <div className="sticky top-20 z-40 bg-black/50 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center py-4">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-800/50 shadow-2xl">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'overview' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                    <span>Overview</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'profile' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'jobs' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    <span>Job Matcher</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'tracker' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Tracker</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'interview' 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Interview</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'subscription' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Subscription</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto px-6">
              {/* Welcome Section */}
              <div className="text-center mb-16">
                              <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text-animated">
                Welcome to Rezzy
              </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Your AI-powered job application assistant. Upload your resume, find relevant jobs, 
                  track applications, and prepare for interviews with personalized insights.
                </p>
                
                {/* Usage Status */}
                {usage && (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300">
                      <h3 className="text-2xl font-semibold mb-6 text-white">Your Usage This Month</h3>
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="text-3xl font-bold text-white mb-2">
                            {usage.scans_used}/{plan === 'free' ? '5' : '∞'}
                          </div>
                          <div className="text-gray-400">Resume Scans</div>
                        </div>
                        {plan === 'premium' && (
                          <>
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="text-3xl font-bold text-white mb-2">
                                {usage.cover_letters_generated || 0}
                              </div>
                              <div className="text-gray-400">Cover Letters</div>
                            </div>
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="text-3xl font-bold text-white mb-2">
                                {usage.interview_questions_generated || 0}
                              </div>
                              <div className="text-gray-400">Interview Q&As</div>
                            </div>
                          </>
                        )}
                      </div>
                      {plan === 'free' && usage.scans_used >= 5 && (
                        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                          <div className="text-center">
                            <p className="text-yellow-300 text-sm mb-3">
                              You&apos;ve used all 5 free scans this month. Upgrade to Starter for unlimited scans!
                            </p>
                            <Button 
                              onClick={() => setActiveTab('subscription')}
                              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded-xl transition-colors"
                            >
                              Upgrade to Starter
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-6 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group card-3d glass-effect-dark"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Profile Setup</h3>
                  <p className="text-gray-400 text-sm">Complete your profile and upload your resume</p>
                </div>

                <div 
                  onClick={() => setActiveTab('jobs')}
                  className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-6 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group card-3d glass-effect-dark"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Find Jobs</h3>
                  <p className="text-gray-400 text-sm">Discover relevant job opportunities</p>
                </div>

                <div 
                  onClick={() => setActiveTab('tracker')}
                  className="bg-gradient-to-br from-green-500/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-6 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group card-3d glass-effect-dark"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Track Applications</h3>
                  <p className="text-gray-400 text-sm">Monitor your job application progress</p>
                </div>

                <div 
                  onClick={() => setActiveTab('interview')}
                  className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm rounded-3xl p-6 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group card-3d glass-effect-dark"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Interview Prep</h3>
                  <p className="text-gray-400 text-sm">Prepare for interviews with AI assistance</p>
                </div>
              </div>

              {/* Job Recommendations Section */}
              {userProfile && (userProfile.position_level || userProfile.job_category) && (
                <div className="mb-16">
                  <JobRecommendations userProfile={userProfile} onSwitchTab={setActiveTab} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && <Profile />}
          {activeTab === 'jobs' && <JobMatcher onSwitchTab={setActiveTab} />}
          {activeTab === 'tracker' && <JobTracker />}
          {activeTab === 'interview' && <InterviewPrep />}
          {activeTab === 'subscription' && <SubscriptionManager />}
        </div>
      </main>
    </div>
  );
}
