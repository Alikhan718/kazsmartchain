'use client';

import { Certificate } from './LoginForm';
import { Check, AlertCircle, Building2, User } from 'lucide-react';
// Форматирование даты без внешних библиотек
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

interface CertificateSelectorProps {
  certificates: Certificate[];
  selected: Certificate | null;
  onSelect: (cert: Certificate) => void;
}

export function CertificateSelector({
  certificates,
  selected,
  onSelect,
}: CertificateSelectorProps) {
  const isCertificateValid = (cert: Certificate): boolean => {
    const now = new Date();
    return cert.validFrom <= now && cert.validTo >= now;
  };

  const getCertificateType = (cert: Certificate): 'individual' | 'organization' => {
    return cert.subject.organizationName ? 'organization' : 'individual';
  };

  const getDisplayName = (cert: Certificate): string => {
    if (cert.subject.organizationName) {
      return cert.subject.organizationName;
    }
    const parts = [
      cert.subject.surname,
      cert.subject.givenName,
    ].filter(Boolean);
    return parts.join(' ') || cert.subject.commonName || 'Неизвестно';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Выберите сертификат для входа:
      </label>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {certificates.map((cert) => {
          const isValid = isCertificateValid(cert);
          const isSelected = selected?.alias === cert.alias;
          const type = getCertificateType(cert);
          const displayName = getDisplayName(cert);

          return (
            <button
              key={cert.alias}
              onClick={() => onSelect(cert)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/50'
              } ${!isValid ? 'opacity-60' : ''}`}
              disabled={!isValid}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {type === 'organization' ? (
                      <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                      {displayName}
                    </span>
                  </div>
                  
                  {cert.subject.email && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                      {cert.subject.email}
                    </p>
                  )}
                  
                  {cert.issuer.organizationName && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate mb-2">
                      Издатель: {cert.issuer.organizationName}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Действителен до:{' '}
                      <span className={isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {formatDate(new Date(cert.validTo))}
                      </span>
                    </span>
                  </div>
                  
                  {!isValid && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>Сертификат истек</span>
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {certificates.length === 0 && (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Не найдено доступных сертификатов
          </p>
        </div>
      )}
    </div>
  );
}

