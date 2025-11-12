import './globals.css';
import React from 'react';
import { Providers } from './providers';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import { TenantSwitcher } from '../components/TenantSwitcher';
import { Home, Users, Network, FileText } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Providers>
          <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50 shadow-lg shadow-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Logo />
                <nav className="hidden md:flex gap-1">
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>Главная</span>
                  </Link>
                  <Link 
                    href="/orgs" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Организации</span>
                  </Link>
                  <Link 
                    href="/network" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    <Network className="w-4 h-4" />
                    <span>Сеть</span>
                  </Link>
                  <Link 
                    href="/audit" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Аудит</span>
                  </Link>
                </nav>
              </div>
              <TenantSwitcher />
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}



