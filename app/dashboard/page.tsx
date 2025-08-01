'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState<'free' | 'premium' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetch(`http://127.0.0.1:8000/api/get-plan?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => setPlan(data.plan))
        .catch(err => setError('Failed to load plan.'));
    }
  }, [isLoaded, user]);

  if (!isLoaded || !user) return <div className="text-white p-10">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;
  if (!plan) return <div className="text-white p-10">Loading plan...</div>;

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
      <p className="mt-4">Your current plan: <span className="font-semibold">{plan}</span></p>

      <div className="mt-10">
        <h2 className="text-xl font-bold">Features</h2>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>Resume Scoring</li>
          <li>Keyword Matching</li>
          <li className={plan === 'free' ? 'text-gray-500 line-through' : ''}>
            AI Resume Tailoring (Premium)
          </li>
          <li className={plan === 'free' ? 'text-gray-500 line-through' : ''}>
            Interview Question Generator (Premium)
          </li>
        </ul>

        {plan === 'free' && (
          <button
            className="mt-6 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded"
            onClick={() => window.location.href = '/upgrade'}
          >
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
}
