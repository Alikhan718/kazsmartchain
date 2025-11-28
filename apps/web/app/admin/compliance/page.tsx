'use client';

import { Shield, CheckCircle, AlertTriangle, FileCheck, Lock, Users, Database } from 'lucide-react';

interface ComplianceMetric {
  id: string;
  category: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  score: number;
  description: string;
  details: string;
}

export default function CompliancePage() {
  const complianceMetrics: ComplianceMetric[] = [
    {
      id: '1',
      category: 'Data Protection | Защита данных',
      status: 'compliant',
      score: 98,
      description: 'GDPR and Kazakhstan PDL compliance',
      details: 'All personal data is encrypted and stored in compliance with Kazakhstan Personal Data Law',
    },
    {
      id: '2',
      category: 'Access Control | Контроль доступа',
      status: 'compliant',
      score: 95,
      description: 'RBAC and multi-signature requirements',
      details: 'Role-based access control implemented with multi-signature approval for sensitive operations',
    },
    {
      id: '3',
      category: 'Audit Trail | Журнал аудита',
      status: 'compliant',
      score: 100,
      description: 'Complete immutable audit logs',
      details: 'All transactions and system events are logged immutably on blockchain',
    },
    {
      id: '4',
      category: 'Identity Verification | Верификация личности',
      status: 'warning',
      score: 85,
      description: 'KYC/AML procedures',
      details: 'Basic KYC implemented, enhanced AML monitoring recommended',
    },
    {
      id: '5',
      category: 'Financial Compliance | Финансовое соответствие',
      status: 'compliant',
      score: 92,
      description: 'National Bank of Kazakhstan regulations',
      details: 'Compliant with NBK digital currency and payment system regulations',
    },
    {
      id: '6',
      category: 'Smart Contract Security | Безопасность контрактов',
      status: 'compliant',
      score: 96,
      description: 'Audited and verified smart contracts',
      details: 'All smart contracts are audited and formally verified',
    },
  ];

  const overallScore = Math.round(
    complianceMetrics.reduce((sum, m) => sum + m.score, 0) / complianceMetrics.length
  );

  const compliantCount = complianceMetrics.filter((m) => m.status === 'compliant').length;
  const warningCount = complianceMetrics.filter((m) => m.status === 'warning').length;
  const nonCompliantCount = complianceMetrics.filter((m) => m.status === 'non-compliant').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'non-compliant':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'non-compliant':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Compliance & Security | Соответствие и безопасность
        </h1>
        <p className="text-gray-400 mt-2">
          Regulatory compliance monitoring for KazSmartChain | Мониторинг регуляторного соответствия
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Overall Compliance Score</h2>
            <p className="text-gray-300 mb-4">Общий балл соответствия</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">{compliantCount} Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">{warningCount} Warning</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">{nonCompliantCount} Non-compliant</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${overallScore * 3.51} 351`}
                className="text-green-400"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{overallScore}</div>
                <div className="text-xs text-gray-400">/ 100</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complianceMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{metric.category}</h3>
                <p className="text-sm text-gray-400 mb-3">{metric.description}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(metric.status)}`}>
                {getStatusIcon(metric.status)}
                <span className="text-sm font-semibold capitalize">{metric.status}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Compliance Score</span>
                <span className="text-lg font-bold text-white">{metric.score}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    metric.score >= 95 ? 'bg-green-500' :
                    metric.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-400">{metric.details}</p>
          </div>
        ))}
      </div>

      {/* Regulatory Framework */}
      <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Regulatory Framework | Регуляторная база
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <FileCheck className="h-6 w-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">Kazakhstan Laws</h3>
              <p className="text-sm text-gray-400">
                Personal Data Law, Digital Assets Law, Payment Systems Law
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="h-6 w-6 text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">International Standards</h3>
              <p className="text-sm text-gray-400">
                GDPR, ISO 27001, PCI DSS compliance
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-purple-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">Banking Regulations</h3>
              <p className="text-sm text-gray-400">
                National Bank of Kazakhstan digital currency requirements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

