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
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white text-black dark:bg-black dark:text-white"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Pricing</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          Simple, transparent pricing. No hidden fees.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Free Plan */}
          <div className="border border-blue-500 rounded-lg p-8 shadow-lg bg-blue-50 dark:bg-blue-900/10">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Perfect for getting started
            </p>
            <p className="text-4xl font-bold text-blue-600 mb-6">$0</p>
            <ul className="text-left mb-6 space-y-2">
              <li>✅ 5 Resume Scans</li>
              <li>✅ Basic ATS Check</li>
              <li>✅ AI Suggestions</li>
              <li>✅ Keyword Analysis</li>
            </ul>
            <button 
              onClick={() => handleGetStarted('free')}
              disabled={loading === 'free'}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'free' ? 'Loading...' : 'Get Started'}
            </button>
          </div>

          {/* Starter Plan */}
          <div className="border border-green-500 rounded-lg p-8 shadow-lg bg-green-50 dark:bg-green-900/10">
            <h3 className="text-2xl font-semibold mb-2">Starter</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For active job seekers
            </p>
            <p className="text-4xl font-bold text-green-600 mb-6">$9<span className="text-lg font-medium">/mo</span></p>
            <ul className="text-left mb-6 space-y-2">
              <li>✅ Unlimited Resume Scans</li>
              <li>✅ Advanced Keyword Analysis</li>
              <li>✅ ATS Optimization Tips</li>
              <li>✅ Resume Scoring</li>
              <li>✅ Detailed Feedback</li>
            </ul>
            <button 
              onClick={() => handleUpgrade('starter')}
              disabled={loading === 'starter'}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'starter' ? 'Loading...' : 'Upgrade Now'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="border border-pink-500 rounded-lg p-8 shadow-lg bg-pink-50 dark:bg-pink-900/10">
            <h3 className="text-2xl font-semibold mb-2">Premium</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Complete job search toolkit
            </p>
            <p className="text-4xl font-bold text-pink-600 mb-6">$19<span className="text-lg font-medium">/mo</span></p>
            <ul className="text-left mb-6 space-y-2">
              <li>🚀 Everything in Starter</li>
              <li>🚀 AI Cover Letter Generation</li>
              <li>🚀 Interview Question Generator</li>
              <li>🚀 Advanced Analytics</li>
              <li>🚀 Priority Support</li>
              <li>🚀 Resume History</li>
            </ul>
            <button 
              onClick={() => handleUpgrade('premium')}
              disabled={loading === 'premium'}
              className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'premium' ? 'Loading...' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
