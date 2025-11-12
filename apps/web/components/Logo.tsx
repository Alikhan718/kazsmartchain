import React from 'react';
import Link from 'next/link';

export function Logo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className} group`}>
      <div className="relative">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-105">
          <rect x="1" y="1" width="30" height="30" rx="7" stroke="url(#logoGradient)" strokeWidth="2" className="drop-shadow-lg"/>
          <path d="M8 20L14 10L18 18L24 10" stroke="url(#logoGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <span className="font-bold text-lg bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
        KazSmartChain
      </span>
    </Link>
  );
}


