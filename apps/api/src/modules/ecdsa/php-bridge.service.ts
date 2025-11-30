import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class PHPBridgeService {
  private readonly logger = new Logger(PHPBridgeService.name);
  private readonly phpPath = process.env.PHP_PATH || 'php';
  private readonly kalkancryptPath = process.env.KALKANCRYPT_PATH || 
    path.join(process.cwd(), 'SDK 2.0', 'PHP_Linux', 'lib', '8.2', 'NTS', 'kalkancrypt.so');

  /**
   * Проверка подписи через KalkanCrypt PHP
   */
  async verifySignature(
    certificate: string,
    data: string,
    signature: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(`PHP verifySignature: cert length=${certificate?.length || 0}, data length=${data?.length || 0}, signature length=${signature?.length || 0}`);
      this.logger.debug(`Certificate preview: ${certificate?.substring(0, 100)}`);
      
      // Создаем временный PHP скрипт для проверки подписи
      const phpScript = this.generateVerifyScript(certificate, data, signature);
      
      // Используем временный файл вместо передачи через -r
      const tempFile = path.join('/tmp', `kalkancrypt_verify_${Date.now()}_${Math.random().toString(36).substring(7)}.php`);
      
      try {
        // Записываем скрипт во временный файл
        fs.writeFileSync(tempFile, phpScript, 'utf8');
        
        // Устанавливаем LD_LIBRARY_PATH для поиска libpcsclite.so.1
        const env = {
          ...process.env,
          LD_LIBRARY_PATH: '/usr/lib/x86_64-linux-gnu:' + (process.env.LD_LIBRARY_PATH || ''),
        };
        
        const { stdout, stderr } = await execAsync(
          `${this.phpPath} ${tempFile}`,
          { 
            timeout: 30000,
            env: env,
          }
        );

        // Логируем все выводы PHP для диагностики
        if (stderr) {
          const cleanStderr = stderr.split('\n').filter(line => 
            !line.includes('Warning') && 
            !line.includes('PHP Startup') &&
            !line.includes('Deprecated')
          ).join('\n');
          if (cleanStderr.trim()) {
            this.logger.warn('PHP stderr:', cleanStderr);
          }
        }
        
        const result = stdout.trim();
        this.logger.debug(`PHP verification result: ${result}`);
        this.logger.debug(`PHP stdout full: ${stdout.substring(0, 500)}`);

        return result === 'true';
      } finally {
        // Удаляем временный файл
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (e) {
          // Игнорируем ошибки удаления
        }
      }
    } catch (error: any) {
      this.logger.error('Error verifying signature via PHP', error);
      // В режиме разработки возвращаем true для тестирования
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('Development mode: signature verification bypassed');
        return true;
      }
      throw error;
    }
  }

  /**
   * Извлечение информации из сертификата через KalkanCrypt PHP
   */
  async extractCertificateInfo(certificate: string): Promise<any> {
    try {
      const phpScript = this.generateExtractInfoScript(certificate);
      
      // Используем временный файл вместо передачи через -r
      const tempFile = path.join('/tmp', `kalkancrypt_extract_${Date.now()}_${Math.random().toString(36).substring(7)}.php`);
      
      try {
        // Записываем скрипт во временный файл
        fs.writeFileSync(tempFile, phpScript, 'utf8');
        
        // Устанавливаем LD_LIBRARY_PATH для поиска libpcsclite.so.1
        const env = {
          ...process.env,
          LD_LIBRARY_PATH: '/usr/lib/x86_64-linux-gnu:' + (process.env.LD_LIBRARY_PATH || ''),
        };
        
        const { stdout, stderr } = await execAsync(
          `${this.phpPath} ${tempFile}`,
          { 
            timeout: 30000,
            env: env,
          }
        );

        if (stderr && !stderr.includes('Warning') && !stderr.includes('PHP Startup')) {
          this.logger.warn('PHP stderr:', stderr);
        }

        // Парсим JSON результат
        try {
          return JSON.parse(stdout.trim());
        } catch {
          return {};
        }
      } finally {
        // Удаляем временный файл
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (e) {
          // Игнорируем ошибки удаления
        }
      }
    } catch (error: any) {
      this.logger.error('Error extracting certificate info via PHP', error);
      return {};
    }
  }

  /**
   * Генерация PHP скрипта для проверки подписи
   */
  private generateVerifyScript(
    certificate: string,
    data: string,
    signature: string,
  ): string {
    // Константы для KalkanCrypt (из kalkanFlags&constants.php)
    const constants = `
      $KC_SIGN_CMS = 0x2;
      $KC_IN_PEM = 0x4;
      $KC_IN_BASE64 = 0x10;
      $KC_IN2_BASE64 = 0x20;
      $KC_OUT_PEM = 0x200;
      $KC_OUT_BASE64 = 0x800;
      $KC_DETACHED_DATA = 0x40;
    `;
    
    // Кодируем данные в base64 для безопасной передачи в PHP скрипт
    // ВАЖНО: данные уже в base64, но нужно правильно экранировать их для PHP
    const certBase64 = Buffer.from(certificate).toString('base64');
    // Данные и подпись уже в base64, но нужно экранировать специальные символы для PHP строки
    // Используем addslashes для экранирования кавычек и обратных слешей
    const dataBase64 = data.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$');
    const sigBase64 = signature.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$');
    
    return `
      <?php
      ${constants}
      try {
        // Расширение уже загружено через php.ini, не используем dl()
        if (!function_exists('KalkanCrypt_Init')) {
          throw new Exception('KalkanCrypt extension not loaded');
        }
        
        KalkanCrypt_Init();
        
        // Данные и подпись уже в base64
        // ВАЖНО: данные должны быть в base64 формате (как строка, не декодированные)
        // Используем heredoc синтаксис для безопасной передачи данных
        $data = <<<'EOD'
${dataBase64}
EOD;
        $signature = <<<'EOS'
${sigBase64}
EOS;
        
        // Логируем что получили перед очисткой
        error_log("=== BEFORE CLEANING ===");
        error_log("Raw data length: " . strlen($data));
        error_log("Raw signature length: " . strlen($signature));
        error_log("Raw data (first 200 chars): " . substr($data, 0, 200));
        error_log("Raw signature (first 200 chars): " . substr($signature, 0, 200));
        error_log("Raw data contains newlines: " . (strpos($data, "\n") !== false ? 'yes' : 'no'));
        error_log("Raw data contains spaces: " . (strpos($data, " ") !== false ? 'yes' : 'no'));
        
        // Флаги для проверки CMS-detached подписи в base64 формате
        // Согласно SDK примеру 6 (строка 188): 
        // KC_SIGN_CMS + KC_IN_BASE64 + KC_IN2_BASE64 + KC_OUT_BASE64 + KC_DETACHED_DATA
        // KC_IN_BASE64 (0x10) - данные в base64
        // KC_IN2_BASE64 (0x20) - подпись в base64  
        // KC_OUT_BASE64 (0x800) - выходные данные в base64
        // KC_DETACHED_DATA (0x40) - данные хранятся отдельно от подписи
        $flags = $KC_SIGN_CMS | $KC_IN_BASE64 | $KC_IN2_BASE64 | $KC_OUT_BASE64 | $KC_DETACHED_DATA;
        
        // Логируем флаги для отладки
        error_log("Verify flags: " . dechex($flags) . " (hex) = " . $flags . " (dec)");
        error_log("  KC_SIGN_CMS: " . ($KC_SIGN_CMS));
        error_log("  KC_IN_BASE64: " . ($KC_IN_BASE64));
        error_log("  KC_IN2_BASE64: " . ($KC_IN2_BASE64));
        error_log("  KC_OUT_BASE64: " . ($KC_OUT_BASE64));
        error_log("  KC_DETACHED_DATA: " . ($KC_DETACHED_DATA));
        
        // KalkanCrypt_VerifyData($alias, $flags, $inData, $inCertID, $outSign, $outData, $outVerifyInfo, $outCert)
        // Для detached подписи данные передаются как есть (в base64), KalkanCrypt сам декодирует их
        // Согласно SDK примеру 6 (строка 220): $inCertID = 0 означает использовать сертификат из подписи
        $alias = ""; // Пустой alias для проверки без хранилища
        $inCertID = 0; // ID сертификата (0 = использовать из подписи)
        $outData = "";
        $outVerifyInfo = "";
        $outCert = "";
        
        // Важно: данные и подпись должны быть в base64 формате (без переносов строк)
        // Убираем все пробелы и переносы строк из base64 строк
        $data = preg_replace('/\s+/', '', $data);
        $signature = preg_replace('/\s+/', '', $signature);
        
        // Проверяем что base64 строки валидны
        error_log("=== AFTER CLEANING ===");
        error_log("Cleaned data length: " . strlen($data));
        error_log("Cleaned signature length: " . strlen($signature));
        error_log("Cleaned data (first 200 chars): " . substr($data, 0, 200));
        error_log("Cleaned signature (first 200 chars): " . substr($signature, 0, 200));
        
        // Проверяем формат base64 перед декодированием
        $dataIsBase64 = preg_match('/^[A-Za-z0-9+\/]*={0,2}$/', $data);
        $sigIsBase64 = preg_match('/^[A-Za-z0-9+\/]*={0,2}$/', $signature);
        error_log("Data matches base64 pattern: " . ($dataIsBase64 ? 'yes' : 'no'));
        error_log("Signature matches base64 pattern: " . ($sigIsBase64 ? 'yes' : 'no'));
        
        $decodedData = base64_decode($data, true);
        $decodedSig = base64_decode($signature, true);
        
        if ($decodedData === false) {
          error_log("ERROR: Data is not valid base64");
          error_log("  Data string (first 500 chars): " . substr($data, 0, 500));
          error_log("  Data length: " . strlen($data));
          error_log("  Data matches base64 pattern: " . ($dataIsBase64 ? 'yes' : 'no'));
          error_log("  Data hex dump (first 100 bytes): " . bin2hex(substr($data, 0, 100)));
          echo 'false';
          exit;
        }
        if ($decodedSig === false) {
          error_log("ERROR: Signature is not valid base64");
          echo 'false';
          exit;
        }
        
        error_log("Cleaned data length: " . strlen($data));
        error_log("Cleaned signature length: " . strlen($signature));
        error_log("Decoded data length: " . strlen($decodedData));
        error_log("Decoded signature length: " . strlen($decodedSig));
        error_log("Data preview: " . substr($data, 0, 50));
        error_log("Signature preview: " . substr($signature, 0, 50));
        
        $result = KalkanCrypt_VerifyData($alias, $flags, $data, $inCertID, $signature, $outData, $outVerifyInfo, $outCert);
        
        // Если результат = 0, то проверка успешна
        // Логируем результат для отладки
        if ($result != 0) {
          $errorCode = KalkanCrypt_GetLastError();
          $errorMsg = KalkanCrypt_GetLastErrorString();
          // Выводим ошибку в stderr чтобы она попала в логи
          error_log("KalkanCrypt_VerifyData failed:");
          error_log("  Result code: $result");
          error_log("  Error code: $errorCode");
          error_log("  Error message: $errorMsg");
          error_log("  Flags used: $flags (dec) = 0x" . dechex($flags) . " (hex)");
          error_log("  Data length: " . strlen($data));
          error_log("  Signature length: " . strlen($signature));
          error_log("  OutVerifyInfo: " . substr($outVerifyInfo, 0, 200));
        } else {
          error_log("KalkanCrypt_VerifyData succeeded");
          error_log("  OutVerifyInfo: " . substr($outVerifyInfo, 0, 200));
        }
        
        echo ($result == 0) ? 'true' : 'false';
      } catch (Exception $e) {
        error_log("PHP Exception in verify script: " . $e->getMessage());
        echo 'false';
      }
    `;
  }

  /**
   * Генерация PHP скрипта для извлечения информации из сертификата
   */
  private generateExtractInfoScript(certificate: string): string {
    // Константы для KalkanCrypt
    const constants = `
      $KC_CERTPROP_SUBJECT_COMMONNAME = 0x80a;
      $KC_CERTPROP_SUBJECT_SURNAME = 0x80c;
      $KC_CERTPROP_SUBJECT_GIVENNAME = 0x80b;
      $KC_CERTPROP_SUBJECT_EMAIL = 0x80e;
      $KC_CERTPROP_SUBJECT_ORG_NAME = 0x80f;
      $KC_CERTPROP_SUBJECT_SERIALNUMBER = 0x80d;
      $KC_CERTPROP_CERT_SN = 0x819;
      $KC_CERTPROP_NOTBEFORE = 0x813;
      $KC_CERTPROP_NOTAFTER = 0x814;
    `;
    
    // Кодируем сертификат в base64 для безопасной передачи
    const certBase64 = Buffer.from(certificate).toString('base64');
    
    return `
      <?php
      ${constants}
      try {
        // Расширение уже загружено через php.ini, не используем dl()
        if (!function_exists('KalkanCrypt_Init')) {
          throw new Exception('KalkanCrypt extension not loaded');
        }
        
        KalkanCrypt_Init();
        
        // Декодируем сертификат из base64 (он в PEM формате)
        $cert = base64_decode('${certBase64}');
        
        $info = array();
        
        // Извлечение данных через KalkanCrypt_X509CertificateGetInfo
        // Сигнатура: KalkanCrypt_X509CertificateGetInfo($propId, $cert, $outData)
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_SUBJECT_COMMONNAME, $cert, $outData);
        if ($err == 0) $info['subjectCN'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_SUBJECT_SURNAME, $cert, $outData);
        if ($err == 0) $info['subjectSurname'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_SUBJECT_GIVENNAME, $cert, $outData);
        if ($err == 0) $info['subjectGivenName'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_SUBJECT_EMAIL, $cert, $outData);
        if ($err == 0) $info['subjectEmail'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_SUBJECT_ORG_NAME, $cert, $outData);
        if ($err == 0) $info['subjectOrgName'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_SUBJECT_SERIALNUMBER, $cert, $outData);
        if ($err == 0) $info['subjectSerialNumber'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_CERT_SN, $cert, $outData);
        if ($err == 0) $info['serialNumber'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_NOTBEFORE, $cert, $outData);
        if ($err == 0) $info['notBefore'] = $outData;
        
        $outData = '';
        $err = KalkanCrypt_X509CertificateGetInfo($KC_CERTPROP_NOTAFTER, $cert, $outData);
        if ($err == 0) $info['notAfter'] = $outData;
        
        echo json_encode($info);
      } catch (Exception $e) {
        echo json_encode(array('error' => $e->getMessage()));
      }
    `;
  }

  /**
   * Извлечение сертификата из CMS подписи
   */
  async extractCertificateFromCMS(signature: string): Promise<string | null> {
    const tempFile = path.join('/tmp', `kalkancrypt_extract_cert_${Date.now()}_${Math.random().toString(36).substring(7)}.php`);
    
    try {
      const phpScript = this.generateExtractCertFromCMSScript(signature);
      fs.writeFileSync(tempFile, phpScript, 'utf8');
      
      const env = {
        ...process.env,
        LD_LIBRARY_PATH: '/usr/lib/x86_64-linux-gnu:' + (process.env.LD_LIBRARY_PATH || ''),
      };
      
      const { stdout, stderr } = await execAsync(
        `${this.phpPath} ${tempFile}`,
        { 
          timeout: 30000,
          env: env,
        }
      );

      if (stderr && !stderr.includes('Warning') && !stderr.includes('PHP Startup')) {
        this.logger.warn('PHP stderr:', stderr);
      }

      const result = stdout.trim();
      if (result && result.length > 50 && result !== 'null' && result !== 'false') {
        return result;
      }
      
      return null;
    } catch (error: any) {
      this.logger.error('Error extracting certificate from CMS via PHP', error);
      return null;
    } finally {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (e) {
        this.logger.error(`Failed to delete temp file ${tempFile}:`, e);
      }
    }
  }

  /**
   * Генерация PHP скрипта для извлечения сертификата из CMS подписи
   */
  private generateExtractCertFromCMSScript(signature: string): string {
    const constants = `
      $KC_SIGN_CMS = 0x2;
      $KC_IN_BASE64 = 0x10;
      $KC_IN2_BASE64 = 0x20;
    `;
    
    const sigBase64 = signature; // Уже в base64
    
    return `
      <?php
      ${constants}
      try {
        if (!function_exists('KalkanCrypt_Init')) {
          throw new Exception('KalkanCrypt extension not loaded');
        }
        
        KalkanCrypt_Init();
        
        // CMS подпись в base64
        $signature = '${sigBase64}';
        
        // Извлекаем сертификат из CMS подписи
        // KalkanCrypt_getCertFromCMS($signature, $signId, $flags, $outCert)
        $outCert = '';
        $signId = 1; // ID подписи (обычно 1)
        $flags = $KC_SIGN_CMS | $KC_IN_BASE64;
        
        $result = KalkanCrypt_getCertFromCMS($signature, $signId, $flags, $outCert);
        
        if ($result == 0 && $outCert && strlen($outCert) > 50) {
          echo $outCert;
        } else {
          echo 'null';
        }
      } catch (Exception $e) {
        error_log("PHP Error in extractCertFromCMS: " . $e->getMessage());
        echo 'null';
      }
    `;
  }

  /**
   * Проверка доступности PHP и KalkanCrypt
   */
  async checkAvailability(): Promise<boolean> {
    try {
      await execAsync(`${this.phpPath} --version`, { timeout: 5000 });
      
      // Проверка наличия библиотеки
      if (!fs.existsSync(this.kalkancryptPath)) {
        this.logger.warn(`KalkanCrypt library not found at: ${this.kalkancryptPath}`);
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

