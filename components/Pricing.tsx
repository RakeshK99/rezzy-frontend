'use client';

export default function Pricing() {
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

        <div className="grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8 shadow-sm">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Perfect for getting started
            </p>
            <p className="text-4xl font-bold mb-6">$0</p>
            <ul className="text-left mb-6 space-y-2">
              <li>✅ 1 Resume Scan</li>
              <li>✅ Basic ATS Check</li>
              <li>✅ One AI Suggestion</li>
            </ul>
            <button className="w-full py-2 bg-black text-white rounded hover:bg-neutral-800 transition">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border border-pink-500 rounded-lg p-8 shadow-lg bg-pink-50 dark:bg-pink-900/10">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For serious job hunters
            </p>
            <p className="text-4xl font-bold text-pink-600 mb-6">$12<span className="text-lg font-medium">/mo</span></p>
            <ul className="text-left mb-6 space-y-2">
              <li>🚀 Unlimited Resume Scans</li>
              <li>🚀 Full ATS Optimization</li>
              <li>🚀 AI Edits + Job Matching</li>
              <li>🚀 Premium Support</li>
            </ul>
            <button className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
