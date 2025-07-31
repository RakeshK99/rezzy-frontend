'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full px-8 py-4 flex justify-between items-center border-b border-gray-200 bg-white/60 backdrop-blur-md fixed top-0 z-50">
      <div className="text-2xl font-semibold tracking-tight">Rezzy<span className="text-pink-500 ml-1">🧠</span></div>
      <ul className="flex gap-8 text-sm font-medium text-gray-700">
        <li><Link href="/">Home</Link></li>
        <li><Link href="#features">Features</Link></li>
        <li><Link href="#pricing">Pricing</Link></li>
        <li><Link href="#contact">Contact</Link></li>
      </ul>
    </nav>
  );
}
