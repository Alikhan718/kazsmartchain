'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import { TenantSwitcher } from '../components/TenantSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { Home, Users, FileText, Coins, Shield } from 'lucide-react';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // На странице login не показываем header и footer
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Для остальных страниц показываем полный layout с header и footer
  return (
    <>
      <header className="sticky top-0 z-50 glass-strong border-b border-gray-200 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Главная</span>
              </Link>
              <Link 
                href="/orgs" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Организации</span>
              </Link>
              <Link 
                href="/tokens" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
              >
                <Coins className="w-4 h-4" />
                <span>Токены</span>
              </Link>
              <Link 
                href="/explorer" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Explorer</span>
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                title="Superadmin Dashboard"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">Mainnet</span>
            </div>
            <ThemeToggle />
            <TenantSwitcher />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛓️</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">KazSmartChain</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Enterprise Blockchain Platform</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-500">
              <span>Powered by Hyperledger Besu & FireFly</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
