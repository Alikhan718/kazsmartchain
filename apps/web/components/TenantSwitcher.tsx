'use client';
import React from 'react';
import { useUI } from '../store/ui';
import { Building2 } from 'lucide-react';

export function TenantSwitcher() {
  const selectedTenant = useUI((s) => s.selectedTenant);
  const setTenant = useUI((s) => s.setTenant);
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
      <Building2 className="w-4 h-4 text-gray-400" />
      <select
        className="text-sm bg-transparent border-none rounded px-2 py-1 text-gray-200 focus:outline-none focus:ring-0 cursor-pointer"
        value={selectedTenant}
        onChange={(e) => setTenant(e.target.value)}
      >
        <option value="demo-bank">Демо Банк</option>
        <option value="demo-uni">Демо Университет</option>
      </select>
    </div>
  );
}


