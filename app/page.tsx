'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Navigation from "@/components/Navigation";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      // Redirect authenticated users to dashboard
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show landing page only for unauthenticated users
  if (!user) {
    return (
      <div className="bg-black min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <section id="features">
            <Features />
          </section>
          <section id="pricing">
            <Pricing />
          </section>
          <section id="contact">
            <Contact />
          </section>
        </main>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to dashboard...</div>
    </div>
  );
}
