'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface MenuItem {
  title: string;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Introduction',
    path: '/',
  },
  {
    title: 'Getting Started',
    path: '/getting-started',
  },
  {
    title: 'Tokenomics',
    children: [
      { title: 'Overview', path: '/tokenomics' },
      { title: 'Token Utility', path: '/tokenomics/utility' },
      { title: 'Supply Policy', path: '/tokenomics/supply' },
      { title: 'Distribution', path: '/tokenomics/distribution' },
      { title: 'Governance', path: '/tokenomics/governance' },
    ],
  },
  {
    title: 'Technical Architecture',
    children: [
      { title: 'Overview', path: '/architecture' },
      { title: 'Blockchain Layer', path: '/architecture/blockchain' },
      { title: 'Network Infrastructure', path: '/architecture/network' },
      { title: 'Smart Contracts', path: '/architecture/contracts' },
    ],
  },
  {
    title: 'Use Cases',
    children: [
      { title: 'Overview', path: '/use-cases' },
      { title: 'Government Services', path: '/use-cases/government' },
      { title: 'Financial Services', path: '/use-cases/finance' },
      { title: 'Digital Identity', path: '/use-cases/identity' },
    ],
  },
  {
    title: 'API Reference',
    children: [
      { title: 'Overview', path: '/api-reference' },
      { title: 'Authentication', path: '/api-reference/auth' },
      { title: 'Tokens', path: '/api-reference/tokens' },
      { title: 'Transactions', path: '/api-reference/transactions' },
    ],
  },
  {
    title: 'Regulatory',
    path: '/regulatory',
  },
  {
    title: 'SDK',
    path: '/sdk',
  },
];

function MenuSection({ item, level = 0 }: { item: MenuItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(
    item.children?.some((child) => child.path === pathname) || false
  );
  const isActive = item.path === pathname;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      {item.path ? (
        <Link
          href={item.path}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
            isActive
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-600 dark:border-blue-400'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
          }`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <span>{item.title}</span>
        </Link>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
            isOpen
              ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
          }`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />
          <span>{item.title}</span>
        </button>
      )}
      {hasChildren && isOpen && (
        <div className="mt-1">
          {item.children!.map((child, index) => (
            <MenuSection key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 glass h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              KSC
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">KazSmartChain</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Documentation</div>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <nav className="p-2">
        {menuItems.map((item, index) => (
          <MenuSection key={index} item={item} />
        ))}
      </nav>
    </aside>
  );
}

