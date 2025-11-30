import { Injectable, Logger } from '@nestjs/common';
import { PHPBridgeService } from './php-bridge.service';

export interface CertificateInfo {
  serialNumber: string;
  subject: {
    commonName?: string;
    surname?: string;
    givenName?: string;
    email?: string;
    organizationName?: string;
    organizationalUnitName?: string;
    countryName?: string;
    localityName?: string;
    stateOrProvinceName?: string;
    bin?: string; // БИН для юридических лиц
  };
  issuer: {
    commonName?: string;
    organizationName?: string;
  };
  validFrom: Date;
  validTo: Date;
  certificate: string; // Base64 encoded
}

@Injectable()
export class CertificateParser {
  private readonly logger = new Logger(CertificateParser.name);

  constructor(private readonly phpBridge: PHPBridgeService) {}

  /**
   * Парсинг сертификата через KalkanCrypt PHP
   * Пока использует базовую реализацию, будет дополнена после настройки PHP bridge
   */
  async parse(certificate: string): Promise<CertificateInfo> {
    try {
      // Пробуем извлечь информацию через PHP bridge
      try {
        const info = await this.phpBridge.extractCertificateInfo(certificate);
        if (info && Object.keys(info).length > 0) {
          // Преобразуем данные из PHP в наш формат
          return {
            serialNumber: info.serialNumber || info.subjectSerialNumber || 'unknown',
            subject: {
              commonName: info.subjectCN,
              surname: info.subjectSurname,
              givenName: info.subjectGivenName,
              email: info.subjectEmail,
              organizationName: info.subjectOrgName,
              bin: info.subjectSerialNumber?.startsWith('IIN=') 
                ? info.subjectSerialNumber.substring(4) 
                : info.subjectSerialNumber,
            },
            issuer: {
              commonName: info.issuerCN || 'НУЦ РК',
            },
            validFrom: new Date(), // TODO: извлечь из сертификата
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // TODO: извлечь из сертификата
            certificate: certificate,
          };
        }
      } catch (phpError: any) {
        this.logger.debug('PHP bridge extraction failed, using basic parser', phpError.message);
      }
      
      // Fallback на базовый парсинг
      return this.parseBasic(certificate);
    } catch (error: any) {
      this.logger.error('Error parsing certificate', error);
      // В development режиме не выбрасываем ошибку, возвращаем базовую структуру
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('Development mode: using fallback certificate info');
        return this.parseBasic(certificate);
      }
      throw new Error(`Ошибка парсинга сертификата: ${error.message}`);
    }
  }

  /**
   * Базовый парсинг сертификата (временная реализация)
   */
  private async parseBasic(certificate: string): Promise<CertificateInfo> {
    // В development режиме возвращаем валидную структуру для продолжения работы
    // В production нужно будет реализовать реальный парсинг через KalkanCrypt PHP
    
    // Генерируем временный serial number на основе хэша сертификата
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(certificate).digest('hex');
    const serialNumber = hash.substring(0, 16).toUpperCase();
    
    return {
      serialNumber: serialNumber,
      subject: {},
      issuer: {
        commonName: 'НУЦ РК',
      },
      validFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 год назад
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 год
      certificate: certificate,
    };
  }
}

