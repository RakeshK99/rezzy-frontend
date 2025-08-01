'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-white/60 backdrop-blur-md shadow-sm">
      {/* Logo */}
      <Link href="/">
        <div className="text-2xl font-semibold tracking-tight text-gray-800 hover:scale-105 transition-transform cursor-pointer">
          Rezzy <span className="text-pink-500 ml-1">🧠</span>
        </div>
      </Link>

      {/* Navigation Items */}
      <ul className="flex gap-6 text-sm font-medium text-gray-700 items-center">
        <li>
          <Link
            href="#features"
            scroll={true}
            className="hover:text-pink-500 transition-transform duration-200 hover:scale-105"
          >
            Learn More
          </Link>
        </li>

        <SignedOut>
          <li>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="hover:text-pink-500 transition-transform duration-200 hover:scale-105">
                Sign In
              </button>
            </SignInButton>
          </li>
          <li>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="hover:text-pink-500 transition-transform duration-200 hover:scale-105">
                Sign Up
              </button>
            </SignUpButton>
          </li>
        </SignedOut>

        <SignedIn>
          <li>
            <Link
              href="/dashboard"
              className={`transition-transform duration-200 hover:scale-105 ${
                pathname === '/dashboard' ? 'text-pink-500' : ''
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <UserButton afterSignOutUrl="/" />
          </li>
        </SignedIn>
      </ul>
    </nav>
  );
}
