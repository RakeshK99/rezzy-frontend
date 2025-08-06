'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();

  const handleUpgrade = async (plan: string) => {
    if (!isSignedIn) {
      // Redirect to sign in if not authenticated
      window.location.href = '/sign-in';
      return;
    }

    setLoading(plan);
    
    try {
      // Create checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upgrade-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          new_plan: plan,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.success && data.session_id) {
        console.log('🔧 Stripe session created:', data.session_id);
        console.log('🔧 Stripe publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        
        // Redirect to Stripe Checkout using loadStripe
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        
        if (stripe) {
          console.log('🔧 Stripe loaded successfully');
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.session_id,
          });
          if (error) {
            console.error('🔧 Stripe redirect error:', error);
            // Fallback to direct URL redirect
            console.log('🔧 Using fallback redirect method');
            window.location.href = `https://checkout.stripe.com/pay/${data.session_id}`;
          }
        } else {
          console.error('🔧 Failed to load Stripe, using fallback');
          // Fallback to direct URL redirect
          window.location.href = `https://checkout.stripe.com/pay/${data.session_id}`;
        }
      } else {
        console.error('🔧 Invalid response from server:', data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleGetStarted = (plan: string) => {
    if (plan === 'free') {
      // For free plan, redirect to dashboard
      if (isSignedIn) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/sign-up';
      }
    } else {
      // For paid plans, trigger upgrade flow
      handleUpgrade(plan);
    }
  };

  return (
    <section
      id="pricing"
      className="py-32 px-4 relative overflow-hidden bg-black text-white"
    >
      {/* Enhanced 3D Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse morphing-bg"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-green-500/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-1000 morphing-bg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-500/5 to-red-500/5 rounded-full blur-3xl animate-pulse delay-500 morphing-bg"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-40 left-32 w-1 h-1 bg-blue-400/30 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-32 right-1/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float delay-2000"></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-pink-400/30 rounded-full animate-float delay-3000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 gradient-text-animated bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Pricing
          </h2>
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Simple, transparent pricing. No hidden fees.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Free Plan */}
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-2 gradient-text-animated">Free</h3>
            <p className="text-gray-400 mb-4">
              Perfect for getting started
            </p>
            <p className="text-4xl font-bold text-blue-400 mb-6">$0</p>
            <ul className="text-left mb-8 space-y-3">
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                5 Resume Scans
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic ATS Check
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI Suggestions
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Keyword Analysis
              </li>
            </ul>
            <button 
              onClick={() => handleGetStarted('free')}
              disabled={loading === 'free'}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl pulse-glow"
            >
              {loading === 'free' ? 'Loading...' : 'Get Started'}
            </button>
          </div>

          {/* Starter Plan */}
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-green-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d group relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                Most Popular
              </span>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-2 gradient-text-animated">Starter</h3>
            <p className="text-gray-400 mb-4">
              For active job seekers
            </p>
            <p className="text-4xl font-bold text-green-400 mb-6">$9<span className="text-lg font-medium">/mo</span></p>
            <ul className="text-left mb-8 space-y-3">
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited Resume Scans
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced Keyword Analysis
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ATS Optimization Tips
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Resume Scoring
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Detailed Feedback
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade('starter')}
              disabled={loading === 'starter'}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl pulse-glow"
            >
              {loading === 'starter' ? 'Loading...' : 'Upgrade Now'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="glass-effect-dark backdrop-blur-sm rounded-3xl p-8 border border-pink-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300 card-3d group">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-2 gradient-text-animated">Premium</h3>
            <p className="text-gray-400 mb-4">
              Complete job search toolkit
            </p>
            <p className="text-4xl font-bold text-pink-400 mb-6">$19<span className="text-lg font-medium">/mo</span></p>
            <ul className="text-left mb-8 space-y-3">
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Everything in Starter
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI Cover Letter Generation
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Interview Question Generator
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced Analytics
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority Support
              </li>
              <li className="flex items-center glass-effect-dark backdrop-blur-sm rounded-xl p-3 border border-gray-800/30">
                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Resume History
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade('premium')}
              disabled={loading === 'premium'}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-2xl hover:from-pink-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl pulse-glow"
            >
              {loading === 'premium' ? 'Loading...' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
