/**
 * NCALayer Client
 * 
 * Клиент для работы с NCALayer API от НУЦ РК через WebSocket
 * Использует WebSocket соединение на wss://127.0.0.1:13579/
 */

export interface CertificateInfo {
  alias: string; // Alias ключа
  storageName: string; // Имя хранилища (PKCS12, eToken и т.д.) - используется для подписи
  certificate: string; // Base64 encoded PEM
  subject: {
    commonName?: string;
    surname?: string;
    givenName?: string;
    organizationName?: string;
    organizationalUnitName?: string;
    email?: string;
    countryName?: string;
    localityName?: string;
    stateOrProvinceName?: string;
    bin?: string;
  };
  issuer: {
    commonName?: string;
    organizationName?: string;
  };
  validFrom: Date;
  validTo: Date;
}

interface NCALayerResponse {
  code: string;
  message: string;
  responseObject: any;
}

interface NCALayerRequest {
  module: string;
  method: string;
  args?: any[];
}

export class NCALayerClient {
  private ws: WebSocket | null = null;
  private initialized = false;
  private pendingCallbacks = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>();
  private requestId = 0;

  /**
   * Инициализация NCALayer через WebSocket
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('NCALayer доступен только в браузере');
    }

    return new Promise((resolve, reject) => {
      try {
        // Создаем WebSocket соединение с NCALayer
        const ws = new WebSocket('wss://127.0.0.1:13579/');

        ws.onopen = () => {
          console.log('NCALayer WebSocket connection opened');
          this.ws = ws;
          this.initialized = true;
          resolve();
        };

        ws.onerror = (error) => {
          console.error('NCALayer WebSocket error:', error);
          this.initialized = false;
          reject(new Error('Не удалось подключиться к NCALayer. Убедитесь, что NCALayer установлен и запущен.'));
        };

        ws.onclose = (event) => {
          console.log('NCALayer WebSocket connection closed', event);
          this.initialized = false;
          this.ws = null;
          
          if (!event.wasClean) {
            // Соединение закрыто с ошибкой
            reject(new Error('Соединение с NCALayer потеряно. Запустите NCALayer и обновите страницу.'));
          }
        };

        ws.onmessage = (event) => {
          try {
            const result: NCALayerResponse = JSON.parse(event.data);
            this.handleResponse(result);
          } catch (error) {
            console.error('Error parsing NCALayer response:', error);
          }
        };
      } catch (error: any) {
        reject(new Error(`Ошибка инициализации NCALayer: ${error.message}`));
      }
    });
  }

  /**
   * Обработка ответов от NCALayer
   */
  private handleResponse(result: NCALayerResponse): void {
    // В оригинальном API используется глобальный callback
    // Мы используем очередь запросов - обрабатываем первый ожидающий callback
    const callbacks = Array.from(this.pendingCallbacks.entries());
    if (callbacks.length > 0) {
      const [requestId, { resolve, reject }] = callbacks[0];
      this.pendingCallbacks.delete(requestId);

      if (result.code === '200') {
        resolve(result.responseObject);
      } else {
        reject(new Error(result.message || 'Ошибка выполнения операции'));
      }
    }
  }

  /**
   * Отправка запроса в NCALayer
   */
  private sendRequest(request: NCALayerRequest): Promise<any> {
    if (!this.initialized || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('NCALayer не инициализирован или соединение закрыто'));
    }

    return new Promise((resolve, reject) => {
      const requestId = `req_${this.requestId++}`;
      let timeoutId: NodeJS.Timeout | null = null;
      
      const wrappedResolve = (value: any) => {
        if (timeoutId) clearTimeout(timeoutId);
        if (this.pendingCallbacks.has(requestId)) {
          this.pendingCallbacks.delete(requestId);
        }
        resolve(value);
      };

      const wrappedReject = (error: Error) => {
        if (timeoutId) clearTimeout(timeoutId);
        if (this.pendingCallbacks.has(requestId)) {
          this.pendingCallbacks.delete(requestId);
        }
        reject(error);
      };

      this.pendingCallbacks.set(requestId, { 
        resolve: wrappedResolve, 
        reject: wrappedReject 
      });

      try {
        this.ws!.send(JSON.stringify(request));
        
        // Таймаут для запроса (30 секунд)
        timeoutId = setTimeout(() => {
          wrappedReject(new Error('Таймаут выполнения операции'));
        }, 30000);
      } catch (error: any) {
        wrappedReject(new Error(`Ошибка отправки запроса: ${error.message}`));
      }
    });
  }

  /**
   * Получение списка активных токенов
   */
  async getActiveTokens(): Promise<string[]> {
    const request: NCALayerRequest = {
      module: 'kz.gov.pki.knca.commonUtils',
      method: 'getActiveTokens',
    };

    try {
      const response = await this.sendRequest(request);
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      throw new Error(`Ошибка получения токенов: ${error.message}`);
    }
  }

  /**
   * Получение информации о ключе/сертификате
   */
  async getKeyInfo(storageName: string): Promise<any> {
    const request: NCALayerRequest = {
      module: 'kz.gov.pki.knca.commonUtils',
      method: 'getKeyInfo',
      args: [storageName],
    };

    try {
      const response = await this.sendRequest(request);
      return response;
    } catch (error: any) {
      throw new Error(`Ошибка получения информации о ключе: ${error.message}`);
    }
  }

  /**
   * Получение списка доступных сертификатов
   */
  async getCertificates(): Promise<CertificateInfo[]> {
    if (!this.initialized) {
      throw new Error('NCALayer не инициализирован. Вызовите init() сначала.');
    }

    try {
      // 1. Получить список активных токенов
      const tokens = await this.getActiveTokens();
      
      if (tokens.length === 0) {
        // Если нет токенов, пробуем PKCS12
        tokens.push('PKCS12');
      }

      // 2. Для каждого токена получить информацию о ключе
      const certificates: CertificateInfo[] = [];

      for (const token of tokens) {
        try {
          const keyInfo = await this.getKeyInfo(token);
          
          // Логируем что получили от NCALayer
          console.log(`NCALayer keyInfo for token ${token}:`, {
            hasPem: !!keyInfo.pem,
            pemLength: keyInfo.pem?.length || 0,
            pemPreview: keyInfo.pem?.substring(0, 100),
            pemEnd: keyInfo.pem?.substring(Math.max(0, (keyInfo.pem?.length || 0) - 100)),
            fullKeyInfo: JSON.stringify(keyInfo),
            allKeys: Object.keys(keyInfo),
          });
          
          // Парсинг информации о сертификате
          // Нормализуем PEM сертификат (убираем лишние пробелы, переносы строк)
          let pemCert = keyInfo.pem || '';
          
          // Проверяем альтернативные поля где может быть сертификат
          if (!pemCert || pemCert.trim().length < 50) {
            // Пробуем другие возможные поля
            pemCert = keyInfo.certificate || keyInfo.cert || keyInfo.base64 || keyInfo.certPEM || keyInfo.certificatePEM || '';
            console.warn(`Сертификат для токена ${token} не найден в поле 'pem', пробуем другие поля. Найдено: ${pemCert.substring(0, 50)}`);
          }
          
          // Если сертификат все еще слишком короткий, возможно это только начало
          // В этом случае нужно использовать другой метод для получения полного сертификата
          if (!pemCert || pemCert.trim().length < 50) {
            console.error(`Сертификат для токена ${token} пустой или слишком короткий (${pemCert.length} символов)`);
            console.error(`Полный ответ от getKeyInfo:`, keyInfo);
            
            // Пробуем получить сертификат через getCertificatesList если доступен
            // Но для этого нужен alias, который мы можем получить из keyInfo
            if (keyInfo.alias) {
              console.log(`Пробуем получить сертификат через alias: ${keyInfo.alias}`);
              // В NCALayer нет прямого метода для получения полного сертификата по alias
              // Но мы можем попробовать использовать getKeyInfo с alias вместо storageName
              try {
                const aliasKeyInfo = await this.getKeyInfo(keyInfo.alias);
                console.log(`getKeyInfo с alias вернул:`, {
                  pemLength: aliasKeyInfo.pem?.length || 0,
                  pemPreview: aliasKeyInfo.pem?.substring(0, 100),
                });
                if (aliasKeyInfo.pem && aliasKeyInfo.pem.length > pemCert.length) {
                  pemCert = aliasKeyInfo.pem;
                }
              } catch (aliasError) {
                console.warn(`Не удалось получить сертификат через alias:`, aliasError);
              }
            }
          }
          
          if (!pemCert || pemCert.trim().length < 50) {
            console.warn(`Сертификат для токена ${token} все еще пустой или слишком короткий (${pemCert.length} символов), пропускаем`);
            // Продолжаем с другими токенами
            continue;
          }
          
          // Нормализуем формат PEM
          pemCert = pemCert.trim();
          
          // Убеждаемся что есть правильные заголовки PEM
          if (!pemCert.includes('-----BEGIN CERTIFICATE-----')) {
            // Если это base64 без заголовков, добавляем их
            const base64Content = pemCert.replace(/\s+/g, '');
            // Форматируем base64 в PEM (64 символа на строку)
            const formatted = base64Content.match(/.{1,64}/g)?.join('\n') || base64Content;
            pemCert = `-----BEGIN CERTIFICATE-----\n${formatted}\n-----END CERTIFICATE-----`;
          } else {
            // Нормализуем существующий PEM формат
            pemCert = pemCert.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const lines = pemCert.split('\n');
            const normalized: string[] = [];
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('-----')) {
                normalized.push(trimmed);
              } else if (trimmed) {
                // Убираем пробелы из base64 строк
                normalized.push(trimmed.replace(/\s+/g, ''));
              }
            }
            
            pemCert = normalized.join('\n');
          }
          
          const cert: CertificateInfo = {
            alias: keyInfo.alias || token, // Alias ключа
            storageName: token, // Имя хранилища (используется для подписи)
            certificate: pemCert, // Нормализованный PEM формат сертификата
            subject: this.parseSubjectDN(keyInfo.subjectDn || ''),
            issuer: this.parseSubjectDN(keyInfo.issuerDn || ''),
            validFrom: keyInfo.certNotBefore 
              ? new Date(Number(keyInfo.certNotBefore)) 
              : new Date(),
            validTo: keyInfo.certNotAfter 
              ? new Date(Number(keyInfo.certNotAfter)) 
              : new Date(),
          };

          certificates.push(cert);
        } catch (error: any) {
          console.warn(`Ошибка получения информации о токене ${token}:`, error.message || error);
          // Продолжаем с другими токенами
        }
      }

      return certificates;
    } catch (error: any) {
      // Fallback на mock данные для разработки
      console.warn('Используются mock данные сертификатов:', error.message);
      return this.getMockCertificates();
    }
  }

  /**
   * Подпись данных в формате CMS из Base64
   * @param storageName - Имя хранилища (PKCS12, eToken и т.д.), а не alias ключа
   * @param data - Данные для подписи (в Base64 или обычный текст)
   */
  async signData(storageName: string, data: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('NCALayer не инициализирован');
    }

    try {
      // Конвертируем данные в Base64 если нужно
      const base64Data = this.isBase64(data) ? data : btoa(unescape(encodeURIComponent(data)));

      // Используем createCMSSignatureFromBase64 для подписи
      // Первый аргумент - это имя хранилища (storage name), а не alias ключа
      const request: NCALayerRequest = {
        module: 'kz.gov.pki.knca.commonUtils',
        method: 'createCMSSignatureFromBase64',
        args: [storageName, 'SIGNATURE', base64Data, false], // false = не включать данные в подпись
      };

      const signature = await this.sendRequest(request);
      return signature;
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      
      if (errorMsg.includes('PIN') || errorMsg.includes('парол')) {
        throw new Error('Неверный PIN-код');
      }
      if (errorMsg.includes('storage') || errorMsg.includes('unknown')) {
        throw new Error(`Хранилище "${storageName}" не найдено. Убедитесь, что сертификат доступен.`);
      }
      if (errorMsg.includes('canceled') || errorMsg.includes('отмен')) {
        throw new Error('Операция подписи была отменена. Пожалуйста, повторите попытку и введите PIN-код.');
      }
      throw new Error(`Ошибка подписи данных: ${errorMsg}`);
    }
  }

  /**
   * Получение информации о сертификате по alias
   */
  async getCertificateInfo(alias: string): Promise<CertificateInfo> {
    if (!this.initialized) {
      throw new Error('NCALayer не инициализирован');
    }

    try {
      const keyInfo = await this.getKeyInfo(alias);
      
      return {
        alias: keyInfo.alias || alias,
        storageName: alias, // Используем переданный alias как storageName
        certificate: keyInfo.pem || '',
        subject: this.parseSubjectDN(keyInfo.subjectDn || ''),
        issuer: this.parseSubjectDN(keyInfo.issuerDn || ''),
        validFrom: keyInfo.certNotBefore 
          ? new Date(Number(keyInfo.certNotBefore)) 
          : new Date(),
        validTo: keyInfo.certNotAfter 
          ? new Date(Number(keyInfo.certNotAfter)) 
          : new Date(),
      };
    } catch (error: any) {
      throw new Error(`Ошибка получения информации о сертификате: ${error.message}`);
    }
  }

  /**
   * Парсинг Subject DN или Issuer DN
   */
  private parseSubjectDN(dn: string): CertificateInfo['subject'] {
    const result: CertificateInfo['subject'] = {};
    
    if (!dn) return result;

    // Парсинг формата: CN=..., OU=..., O=..., C=..., E=...
    const parts = dn.split(',').map(p => p.trim());
    
    for (const part of parts) {
      const [key, ...valueParts] = part.split('=');
      const value = valueParts.join('=').trim();
      
      switch (key.trim().toUpperCase()) {
        case 'CN':
          result.commonName = value;
          break;
        case 'SURNAME':
        case 'SN':
          result.surname = value;
          break;
        case 'GIVENNAME':
        case 'GN':
          result.givenName = value;
          break;
        case 'O':
          result.organizationName = value;
          break;
        case 'OU':
          result.organizationalUnitName = value;
          break;
        case 'E':
        case 'EMAILADDRESS':
          result.email = value;
          break;
        case 'C':
          result.countryName = value;
          break;
        case 'L':
          result.localityName = value;
          break;
        case 'ST':
          result.stateOrProvinceName = value;
          break;
        case 'SERIALNUMBER':
          // БИН может быть в формате IIN=... или SERIALNUMBER=...
          if (value.startsWith('IIN=')) {
            result.bin = value.substring(4);
          } else {
            result.bin = value;
          }
          break;
        case 'IIN':
          result.bin = value;
          break;
      }
    }

    return result;
  }

  /**
   * Проверка является ли строка Base64
   */
  private isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  /**
   * Закрытие соединения
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.initialized = false;
    this.pendingCallbacks.clear();
  }

  /**
   * Временные методы для разработки (fallback если NCALayer недоступен)
   */
  private getMockCertificates(): CertificateInfo[] {
    return [
      {
        alias: 'Alias',
        storageName: 'PKCS12', // Имя хранилища для подписи
        certificate: 'MIIF...', // Base64 encoded certificate
        subject: {
          surname: 'Иванов',
          givenName: 'Иван',
          commonName: 'Иванов Иван Иванович',
          email: 'ivan.ivanov@example.com',
        },
        issuer: {
          commonName: 'National Certification Authority',
          organizationName: 'НУЦ РК',
        },
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
      },
      {
        alias: 'OrgAlias',
        storageName: 'PKCS12', // Имя хранилища для подписи
        certificate: 'MIIF...',
        subject: {
          organizationName: 'ТОО "Тестовая Организация"',
          bin: '123456789012',
          email: 'info@test-org.kz',
        },
        issuer: {
          commonName: 'National Certification Authority',
          organizationName: 'НУЦ РК',
        },
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
      },
    ];
  }
}

