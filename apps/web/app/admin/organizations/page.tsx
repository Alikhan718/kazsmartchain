'use client';
import React from 'react';
import { Building2, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';

// Mock data for now
const organizations = [
  {
    id: 'kaspi-bank',
    name: 'Kaspi Bank',
    type: 'bank',
    status: 'active',
    members: 450,
    validators: 2,
    transactionsLast24h: 5247,
    complianceScore: 98,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'halyk-bank',
    name: 'Halyk Bank',
    type: 'bank',
    status: 'active',
    members: 380,
    validators: 1,
    transactionsLast24h: 3891,
    complianceScore: 96,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'ministry-digital',
    name: 'Ministry of Digital Development',
    type: 'government',
    status: 'active',
    members: 125,
    validators: 1,
    transactionsLast24h: 1256,
    complianceScore: 100,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'kaznu',
    name: 'Al-Farabi Kazakh National University',
    type: 'university',
    status: 'active',
    members: 2500,
    validators: 0,
    transactionsLast24h: 342,
    complianceScore: 94,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'new-org',
    name: 'Astana Hub',
    type: 'enterprise',
    status: 'pending',
    members: 0,
    validators: 0,
    transactionsLast24h: 0,
    complianceScore: 0,
    createdAt: new Date('2024-11-20'),
  },
];

const statusColors = {
  active: 'text-green-400 bg-green-500/10 border-green-500/20',
  pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  suspended: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const statusIcons = {
  active: CheckCircle,
  pending: Clock,
  suspended: AlertCircle,
};

const typeColors = {
  bank: 'text-blue-400',
  government: 'text-purple-400',
  university: 'text-green-400',
  enterprise: 'text-orange-400',
};

export default function AdminOrganizationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Organizations Management
          </h1>
          <p className="text-gray-400">
            Approve, configure, and monitor organizations on the network
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
          + Add Organization
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50">
          <div className="text-sm text-gray-400 mb-1">Total</div>
          <div className="text-2xl font-bold text-white">{organizations.length}</div>
        </div>
        <div className="p-4 rounded-lg border border-green-800/50 bg-green-900/20">
          <div className="text-sm text-green-400 mb-1">Active</div>
          <div className="text-2xl font-bold text-white">
            {organizations.filter((o) => o.status === 'active').length}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-yellow-800/50 bg-yellow-900/20">
          <div className="text-sm text-yellow-400 mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">
            {organizations.filter((o) => o.status === 'pending').length}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50">
          <div className="text-sm text-gray-400 mb-1">Total Validators</div>
          <div className="text-2xl font-bold text-white">
            {organizations.reduce((sum, o) => sum + o.validators, 0)}
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="space-y-4">
        {organizations.map((org) => {
          const StatusIcon = statusIcons[org.status as keyof typeof statusIcons];
          return (
            <div
              key={org.id}
              className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40 hover:border-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{org.name}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`font-medium ${typeColors[org.type as keyof typeof typeColors]}`}>
                        {org.type}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">ID: {org.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[org.status as keyof typeof statusColors]}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {org.status}
                  </span>
                  {org.complianceScore > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Compliance: {org.complianceScore}/100
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Members</div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">{org.members.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Validators</div>
                  <div className="text-sm font-medium text-white">{org.validators}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Transactions (24h)</div>
                  <div className="text-sm font-medium text-white">{org.transactionsLast24h.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Joined</div>
                  <div className="text-sm font-medium text-white">{org.createdAt.toLocaleDateString('ru-RU')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Actions</div>
                  <div className="flex gap-2">
                    {org.status === 'pending' && (
                      <>
                        <button className="px-3 py-1 rounded text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1 rounded text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                          Reject
                        </button>
                      </>
                    )}
                    {org.status === 'active' && (
                      <button className="px-3 py-1 rounded text-xs font-medium bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-colors">
                        Configure
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

