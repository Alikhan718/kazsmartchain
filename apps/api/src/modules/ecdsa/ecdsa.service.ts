import { Injectable, Logger } from '@nestjs/common';
import { PHPBridgeService } from './php-bridge.service';
import { CertificateParser, CertificateInfo } from './certificate-parser.service';

@Injectable()
export class ECDSAService {
  private readonly logger = new Logger(ECDSAService.name);

  constructor(
    private readonly phpBridge: PHPBridgeService,
    private readonly certParser: CertificateParser,
  ) {}

  /**
   * Проверка подписи ЭЦП
   */
  async verifySignature(
    certificate: string,
    data: string,
    signature: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(`verifySignature called: cert length=${certificate?.length || 0}, data length=${data?.length || 0}, signature length=${signature?.length || 0}`);
      this.logger.debug(`Original certificate (first 200 chars): ${certificate?.substring(0, 200)}`);
      
      // 1. Нормализовать сертификат
      const normalizedCert = this.normalizeCertificate(certificate);
      this.logger.debug(`Normalized certificate length: ${normalizedCert.length}`);
      this.logger.debug(`Normalized cert preview: ${normalizedCert.substring(0, 150)}...`);
      
      // 2. Проверить формат сертификата
      const isValidFormat = this.isValidCertificateFormat(normalizedCert);
      if (!isValidFormat) {
        this.logger.warn(`Invalid certificate format. Length: ${normalizedCert.length}, Preview: ${normalizedCert.substring(0, 200)}`);
        // В development режиме все равно продолжаем
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn('Development mode: continuing despite invalid certificate format');
        } else {
          return false;
        }
      }

      // 3. Проверить подпись через KalkanCrypt
      // В development режиме PHP bridge может быть недоступен, используем mock проверку
      let isValid = false;
      try {
        isValid = await this.phpBridge.verifySignature(
          normalizedCert,
          data, // Данные в Base64 которые были подписаны
          signature, // CMS подпись в Base64
        );
        this.logger.debug(`PHP bridge verification result: ${isValid}`);
      } catch (phpError: any) {
        this.logger.warn(`PHP bridge error: ${phpError.message}`);
        // В development режиме если PHP недоступен, пропускаем проверку
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn('Development mode: skipping signature verification due to PHP error');
          isValid = true; // Пропускаем проверку в development
        } else {
          return false;
        }
      }

      if (!isValid && process.env.NODE_ENV !== 'development') {
        this.logger.warn('Signature verification failed via PHP bridge');
        return false;
      }

      // 4. Проверить валидность сертификата (CRL, срок действия)
      try {
        const certInfo = await this.certParser.parse(normalizedCert);
        const isCertValid = await this.validateCertificate(certInfo);
        this.logger.debug(`Certificate validation result: ${isCertValid}`);
        return isCertValid;
      } catch (parseError: any) {
        this.logger.warn(`Certificate parsing failed: ${parseError.message}`);
        // В development режиме пропускаем парсинг если он не реализован
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn('Development mode: skipping certificate parsing');
          return isValid; // Возвращаем результат проверки подписи
        }
        return false;
      }
    } catch (error: any) {
      this.logger.error('Error verifying signature', error);
      // В development режиме не блокируем из-за ошибок парсинга
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('Development mode: allowing signature verification to proceed despite error');
        return true;
      }
      return false;
    }
  }

  /**
   * Нормализация сертификата (очистка и форматирование)
   */
  private normalizeCertificate(certificate: string): string {
    if (!certificate) {
      this.logger.warn('Empty certificate provided');
      return '';
    }

    let normalized = certificate.trim();
    this.logger.debug(`Original certificate length: ${normalized.length}, preview: ${normalized.substring(0, 100)}`);

    // Если сертификат уже в PEM формате, нормализуем его
    if (normalized.includes('-----BEGIN CERTIFICATE-----')) {
      // Убираем лишние пробелы и переносы строк между заголовками и содержимым
      normalized = normalized.replace(/\r\n/g, '\n');
      normalized = normalized.replace(/\r/g, '\n');
      
      // Убираем пробелы внутри base64 содержимого
      const lines = normalized.split('\n');
      const result: string[] = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('-----')) {
          result.push(trimmed);
        } else if (trimmed) {
          // Убираем пробелы из base64 строк
          const cleaned = trimmed.replace(/\s+/g, '');
          if (cleaned) {
            result.push(cleaned);
          }
        }
      }
      
      const normalizedPem = result.join('\n');
      this.logger.debug(`Normalized PEM certificate length: ${normalizedPem.length}`);
      return normalizedPem;
    }

    // Если это base64 без заголовков, добавляем их
    const base64Only = normalized.replace(/\s+/g, '');
    if (base64Only.length > 100) {
      // Форматируем base64 в PEM формат (64 символа на строку)
      const formatted = base64Only.match(/.{1,64}/g)?.join('\n') || base64Only;
      const pemWithHeaders = `-----BEGIN CERTIFICATE-----\n${formatted}\n-----END CERTIFICATE-----`;
      this.logger.debug(`Converted base64 to PEM, length: ${pemWithHeaders.length}`);
      return pemWithHeaders;
    }

    this.logger.warn(`Certificate too short to normalize: ${normalized.length} chars`);
    return normalized;
  }

  /**
   * Извлечение данных из сертификата
   */
  async extractCertificateInfo(certificate: string): Promise<CertificateInfo> {
    return this.certParser.parse(certificate);
  }

  /**
   * Извлечение сертификата из CMS подписи
   */
  async extractCertificateFromSignature(signature: string): Promise<string | null> {
    try {
      // Используем PHP bridge для извлечения сертификата из CMS подписи
      return await this.phpBridge.extractCertificateFromCMS(signature);
    } catch (error: any) {
      this.logger.error(`Error extracting certificate from CMS signature: ${error.message}`);
      return null;
    }
  }

  /**
   * Валидация сертификата (CRL, срок действия)
   */
  private async validateCertificate(
    certInfo: CertificateInfo,
  ): Promise<boolean> {
    // 1. Проверить срок действия
    const now = new Date();
    if (certInfo.validFrom > now || certInfo.validTo < now) {
      this.logger.warn('Certificate expired or not yet valid');
      return false;
    }

    // 2. Проверить CRL (Certificate Revocation List)
    // TODO: Реализовать проверку CRL
    // const isRevoked = await this.checkCRL(certInfo.serialNumber);
    // if (isRevoked) {
    //   return false;
    // }

    // 3. Проверить цепочку сертификатов
    // TODO: Реализовать проверку цепочки
    // const chainValid = await this.validateCertificateChain(certInfo);
    // return chainValid;

    return true;
  }

  private isValidCertificateFormat(certificate: string): boolean {
    // Проверить формат сертификата (PEM, DER, base64)
    if (!certificate || certificate.length < 10) {
      this.logger.warn('Certificate is too short or empty');
      return false;
    }
    
    const normalized = certificate.trim();
    
    // Проверка на PEM формат
    if (normalized.includes('-----BEGIN CERTIFICATE-----') && 
        normalized.includes('-----END CERTIFICATE-----')) {
      // Проверяем что между заголовками есть содержимое
      const beginIdx = normalized.indexOf('-----BEGIN CERTIFICATE-----');
      const endIdx = normalized.indexOf('-----END CERTIFICATE-----');
      const content = normalized.substring(beginIdx + 27, endIdx).trim();
      
      if (content.length > 50) {
        this.logger.debug(`Certificate format: PEM (${content.length} chars)`);
        return true;
      }
    }
    
    // Проверка на base64 (без заголовков PEM)
    try {
      const base64Only = normalized.replace(/\s+/g, '').replace(/-----BEGIN CERTIFICATE-----/g, '').replace(/-----END CERTIFICATE-----/g, '');
      if (base64Only.length > 100) {
        const decoded = Buffer.from(base64Only, 'base64');
        // Base64 декодирование успешно и результат имеет разумный размер
        if (decoded.length > 100 && decoded.length < 10000) {
          this.logger.debug(`Certificate format: Base64 (DER, ${decoded.length} bytes)`);
          return true;
        }
      }
    } catch {
      // Не base64
    }
    
    this.logger.warn(`Invalid certificate format. Length: ${normalized.length}, preview: ${normalized.substring(0, 100)}`);
    return false;
  }
}

