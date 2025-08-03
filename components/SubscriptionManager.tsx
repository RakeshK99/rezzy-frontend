'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: Array<{
    price_id: string;
    quantity: number;
  }>;
}

interface SubscriptionData {
  subscription: Subscription | null;
  plan: string;
  customer_id?: string;
}

export default function SubscriptionManager() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/${user.id}`);
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user, fetchSubscription]);

  const handleUpgrade = async (plan: 'starter' | 'premium') => {
    if (!user) return;
    
    setUpgrading(true);
    setMessage('');
    
    try {
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
      
      const data = await response.json();
      
      if (data.success && data.session_id) {
        // Redirect to Stripe Checkout
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.session_id,
          });
          if (error) {
            setMessage('Error redirecting to payment: ' + error.message);
          }
        }
      } else {
        setMessage('Error creating checkout session');
      }
    } catch (error) {
      setMessage('Error upgrading subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }
    
    setCanceling(true);
    setMessage('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Subscription cancelled successfully');
        fetchSubscription(); // Refresh subscription data
      } else {
        setMessage('Error cancelling subscription');
      }
    } catch (error) {
      setMessage('Error cancelling subscription');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free Plan';
      case 'starter': return 'Starter Plan';
      case 'premium': return 'Premium Plan';
      default: return plan;
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'starter': return '$9/month';
      case 'premium': return '$19/month';
      default: return 'Free';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Management</h2>
        
        {message && (
          <div className={`p-4 mb-4 rounded-md ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{getPlanName(subscription?.plan || 'free')}</p>
              <p className="text-gray-600">{getPlanPrice(subscription?.plan || 'free')}</p>
            </div>
            <div className="text-right">
              {subscription?.subscription && (
                <div className="text-sm text-gray-600">
                  <p>Next billing: {formatDate(subscription.subscription.current_period_end)}</p>
                  {subscription.subscription.cancel_at_period_end && (
                    <p className="text-orange-600 font-medium">Cancelling at period end</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Free Plan</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">$0</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 5 resume scans per month</li>
              <li>• Basic AI analysis</li>
              <li>• Standard support</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">Starter Plan</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">$9/month</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited resume scans</li>
              <li>• Advanced AI analysis</li>
              <li>• Priority support</li>
            </ul>
            {subscription?.plan !== 'starter' && subscription?.plan !== 'premium' && (
              <button
                onClick={() => handleUpgrade('starter')}
                disabled={upgrading}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {upgrading ? 'Upgrading...' : 'Upgrade to Starter'}
              </button>
            )}
          </div>
          
          <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-2">Premium Plan</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">$19/month</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Everything in Starter</li>
              <li>• Cover letter generation</li>
              <li>• Interview questions</li>
              <li>• Premium support</li>
            </ul>
            {subscription?.plan !== 'premium' && (
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={upgrading}
                className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {upgrading ? 'Upgrading...' : 'Upgrade to Premium'}
              </button>
            )}
          </div>
        </div>

        {/* Subscription Actions */}
        {subscription?.subscription && subscription.subscription.status === 'active' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Actions</h3>
            
            {subscription.subscription.cancel_at_period_end ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800">
                  Your subscription will be cancelled on {formatDate(subscription.subscription.current_period_end)}. 
                  You can continue using premium features until then.
                </p>
              </div>
            ) : (
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {canceling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Load Stripe
async function loadStripe(publishableKey: string) {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(publishableKey);
} 