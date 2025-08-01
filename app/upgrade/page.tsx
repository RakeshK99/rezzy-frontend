'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '3 AI resume scans per month',
      'Basic keyword analysis',
      'ATS compatibility check',
      'Resume structure analysis'
    ],
    limitations: [
      'Limited to 3 scans per month',
      'No cover letter generation',
      'No interview questions',
      'Basic feedback only'
    ],
    popular: false,
    plan: 'free'
  },
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'For active job seekers',
    features: [
      'Unlimited AI resume scans',
      'Advanced keyword analysis',
      'Detailed improvement suggestions',
      'ATS optimization tips',
      'Resume scoring and feedback',
      'Keyword gap analysis'
    ],
    limitations: [
      'No cover letter generation',
      'No interview questions',
      'No portfolio hosting'
    ],
    popular: false,
    plan: 'starter'
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'Complete job search toolkit',
    features: [
      'Everything in Starter',
      'AI cover letter generation',
      'Interview question generator',
      'Advanced resume analytics',
      'Performance tracking',
      'Priority support'
    ],
    limitations: [
      'No portfolio hosting',
      'No weekly AI reviews'
    ],
    popular: true,
    plan: 'premium'
  },
  {
    name: 'Elite',
    price: '$29',
    period: '/month',
    description: 'For serious professionals',
    features: [
      'Everything in Pro',
      'Portfolio hosting',
      'Weekly AI resume reviews',
      'Job matching engine',
      'Advanced analytics dashboard',
      'Dedicated support'
    ],
    limitations: [],
    popular: false,
    plan: 'elite'
  }
];

export default function Upgrade() {
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          plan: selectedPlan,
          success_url: `${window.location.origin}/dashboard?upgrade=success`,
          cancel_url: `${window.location.origin}/upgrade`
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = `https://checkout.stripe.com/pay/${data.session_id}`;
      } else {
        console.error('Failed to create checkout session');
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('Error upgrading plan:', err);
      alert('Error upgrading plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
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
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user?.firstName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Unlock the full potential of AI-powered resume optimization. Choose the plan that fits your job search needs.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {pricingTiers.map((tier) => (
            <div
              key={tier.plan}
              className={`relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 ${
                selectedPlan === tier.plan
                  ? 'border-pink-500 shadow-lg shadow-pink-500/20'
                  : 'border-gray-800 hover:border-gray-700'
              } ${tier.popular ? 'ring-2 ring-pink-500' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-400 ml-1">{tier.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-green-400">What's included:</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.limitations.length > 0 && (
                  <>
                    <h4 className="font-semibold text-red-400 mt-6">Not included:</h4>
                    <ul className="space-y-3">
                      {tier.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-400 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <Button
                onClick={() => setSelectedPlan(tier.plan)}
                variant={selectedPlan === tier.plan ? 'default' : 'outline'}
                className={`w-full ${tier.popular ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' : ''}`}
              >
                {selectedPlan === tier.plan ? 'Selected' : 'Select Plan'}
              </Button>
            </div>
          ))}
        </div>

        {/* Upgrade Button */}
        <div className="text-center">
          <Button
            onClick={handleUpgrade}
            disabled={loading || selectedPlan === 'free'}
            size="lg"
            className="text-lg px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {loading ? 'Processing...' : `Upgrade to ${pricingTiers.find(t => t.plan === selectedPlan)?.name}`}
          </Button>
          
          {selectedPlan === 'free' && (
            <p className="text-gray-400 mt-4">You're already on the free plan</p>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-3">Can I cancel anytime?</h3>
              <p className="text-gray-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-3">What file formats are supported?</h3>
              <p className="text-gray-400">We support PDF, DOCX, and DOC files for resume uploads. PDF is recommended for best results.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-3">Is my data secure?</h3>
              <p className="text-gray-400">Absolutely. We use enterprise-grade encryption and never store your personal information longer than necessary.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-3">Can I upgrade or downgrade?</h3>
              <p className="text-gray-400">You can upgrade anytime. Downgrades take effect at the next billing cycle. No refunds for partial months.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 