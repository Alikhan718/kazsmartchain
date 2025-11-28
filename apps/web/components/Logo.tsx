import React from 'react';
import Link from 'next/link';

export function Logo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className} group`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-1.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 group-hover:border-cyan-400/50 transition-all">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-105 duration-300">
            <path d="M8 20L14 10L18 18L24 10" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 24L8 16L12 22L16 14L20 20L24 12L28 18" stroke="url(#logoGradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
              <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg text-gradient-main leading-tight">
          KazSmartChain
        </span>
        <span className="text-[10px] text-gray-500 -mt-0.5 tracking-wider">ENTERPRISE BLOCKCHAIN</span>
      </div>
    </Link>
  );
}
