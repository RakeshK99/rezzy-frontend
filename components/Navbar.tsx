'use client';

import Link from 'next/link';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav className="w-full px-8 py-4 flex justify-between items-center border-b border-gray-200 bg-white/60 backdrop-blur-md">
      <div className="text-2xl font-semibold tracking-tight text-gray-800">
        Rezzy<span className="text-pink-500 ml-1">🧠</span>
      </div>
      <ul className="flex gap-6 text-sm font-medium text-gray-700 items-center">
        <li><a href="#home" className="hover:text-pink-500 transition">Home</a></li>
        <li><a href="#features" className="hover:text-pink-500 transition">Features</a></li>
        <li><a href="#pricing" className="hover:text-pink-500 transition">Pricing</a></li>
        <li><a href="#contact" className="hover:text-pink-500 transition">Contact</a></li>

        <SignedOut>
          <li><SignInButton mode="modal"><button className="text-sm hover:text-pink-500">Sign In</button></SignInButton></li>
          <li><SignUpButton mode="modal"><button className="text-sm hover:text-pink-500">Sign Up</button></SignUpButton></li>
        </SignedOut>

        <SignedIn>
          <li><UserButton afterSignOutUrl="/" /></li>
        </SignedIn>
      </ul>
    </nav>
  );
}
