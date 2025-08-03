'use client';

export default function TestEnv() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_API_URL:</strong>
          <p className="text-green-400">{process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:</strong>
          <p className="text-green-400">{process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'NOT SET'}</p>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</strong>
          <p className="text-green-400">{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'NOT SET'}</p>
        </div>
      </div>
      
      <button 
        onClick={async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upgrade-subscription`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                user_id: 'test123',
                new_plan: 'starter'
              }),
            });
            
            const data = await response.json();
            console.log('Test API response:', data);
            alert('Check console for API response');
          } catch (error) {
            console.error('Test API error:', error);
            alert('API call failed - check console');
          }
        }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test API Call
      </button>
    </div>
  );
} 