import React from 'react';
import Link from 'next/link';
import { Shield, Building2, AlertCircle, Network, FileText, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Admin Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            🔐 SUPERADMIN ACCESS
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <nav className="flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors whitespace-nowrap"
        >
          <Shield className="w-4 h-4" />
          <span>Overview</span>
        </Link>
        <Link
          href="/admin/organizations"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors whitespace-nowrap"
        >
          <Building2 className="w-4 h-4" />
          <span>Organizations</span>
        </Link>
        <Link
          href="/admin/validators"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors whitespace-nowrap"
        >
          <Network className="w-4 h-4" />
          <span>Validators</span>
        </Link>
        <Link
          href="/admin/compliance"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors whitespace-nowrap"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Compliance</span>
        </Link>
        <Link
          href="/admin/audit"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors whitespace-nowrap"
        >
          <FileText className="w-4 h-4" />
          <span>Global Audit</span>
        </Link>
      </nav>

      {/* Content */}
      {children}
    </div>
  );
}

