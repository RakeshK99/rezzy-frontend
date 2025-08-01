'use client'

import Link from 'next/link';
import { Button } from '@/components/Button';
import { useUser, useClerk } from '@clerk/nextjs';

export default function Hero() {
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <section className="w-full h-screen flex items-center justify-center flex-col text-center bg-black text-white px-4">
      <h1 className="text-4xl sm:text-6xl font-bold mb-6">
        Perfect Your Resume with <span className="text-pink-500">Rezzy</span>
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl mb-8 text-gray-300">
        Instantly improve your resume using AI. Tailor it to jobs, pass ATS scans, and get interview-ready — in seconds.
      </p>
      <div className="flex gap-4">
        {isSignedIn ? (
          <Link href="/dashboard">
            <Button variant="default">Go to Dashboard</Button>
          </Link>
        ) : (
          <Button variant="default" onClick={() => openSignIn({ redirectUrl: '/dashboard' })}>
            Try Free
          </Button>
        )}
      </div>
    </section>
  );
}
