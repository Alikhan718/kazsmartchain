import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface BiometricSessionResponse {
  session_id: string;
  technologies: string[];
}

/**
 * Biometric.kz session result — uses [key: string]: any for each
 * sub-result because the actual field names from the API differ
 * from what the docs suggest. We discover fields dynamically.
 */
export interface BiometricResultResponse {
  id: string;
  status?: string; // "FINISHED", "PROGRESS", etc.
  flow_session_result?: boolean; // true if all checks passed
  flow_session_failure_reasons?: string[];
  validated_at?: string;
  finished_at?: string;
  technologies: Array<{
    name: string;
    description: string;
    code?: string;
  }>;
  liveness_result?: Record<string, any>;
  edocument_result?: Record<string, any>;
  face2face_result?: Record<string, any>;
  document_recognition_result?: Record<string, any>;
  ip_check_results?: any[];
  request_sessions?: Array<Record<string, any>>;
  [key: string]: any; // catch-all for any extra fields
}

@Injectable()
export class BiometricService {
  private readonly logger = new Logger(BiometricService.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor() {
    const baseURL = process.env.BIOMETRIC_API_URL || 'https://kyc.biometric.kz';
    this.apiKey = process.env.BIOMETRIC_API_KEY || '';

    if (!this.apiKey) {
      this.logger.warn('BIOMETRIC_API_KEY is not set! Biometric authentication will not work.');
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Create a new biometric verification session
   */
  async createSession(metadata?: Record<string, any>): Promise<BiometricSessionResponse> {
    try {
      const payload: Record<string, any> = {
        api_key: this.apiKey,
      };

      if (metadata) {
        payload.metadata = metadata;
      }

      this.logger.log('Creating biometric session...');

      const response = await this.client.post<BiometricSessionResponse>(
        '/api/v1/flows/session/create/',
        payload,
      );

      this.logger.log(`Biometric session created: ${response.data.session_id}, technologies: ${response.data.technologies.join(', ')}`);

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create biometric session: ${error.message}`, error.response?.data);
      throw new Error(`Failed to create biometric session: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get the result of a biometric verification session.
   * 
   * Polls with retry because Biometric.kz returns empty {} objects
   * while results are still being processed server-side.
   * Based on real testing: session finishes at T, but result API
   * returns {} even at T+2s. Need to poll until data appears.
   */
  async getSessionResult(sessionId: string): Promise<BiometricResultResponse> {
    const maxAttempts = 15;
    const delayMs = 3000; // 3 seconds between polls
    const initialDelay = 5000; // wait 5s before first attempt

    this.logger.log(`Session ${sessionId}: waiting ${initialDelay / 1000}s before first result fetch...`);
    await this.delay(initialDelay);

    let lastData: BiometricResultResponse | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`Fetching result for ${sessionId} (attempt ${attempt}/${maxAttempts})`);

        const response = await this.client.get(
          '/api/v1/flows/session/result/',
          {
            params: {
              session_id: sessionId,
              flow_api_key: this.apiKey,
            },
          },
        );

        const data = response.data;
        lastData = data;

        // Log result structure (keys only for sub-objects, skip base64 data)
        this.logger.log(`=== RESULT attempt ${attempt} ===`);
        this.logger.log(`Top-level keys: ${Object.keys(data).join(', ')}`);
        this.logger.log(`status: ${data.status}, flow_session_result: ${data.flow_session_result}`);
        this.logger.log(`finished_at: ${data.finished_at}`);
        if (data.liveness_result) {
          this.logger.log(`liveness_result keys: ${Object.keys(data.liveness_result).join(', ')}`);
          this.logger.log(`liveness_result (no photos): ${JSON.stringify(this.stripBase64(data.liveness_result))}`);
        }
        if (data.edocument_result) {
          this.logger.log(`edocument_result keys: ${Object.keys(data.edocument_result).join(', ')}`);
          this.logger.log(`edocument_result (no photos): ${JSON.stringify(this.stripBase64(data.edocument_result))}`);
        }
        if (data.face2face_result) {
          this.logger.log(`face2face_result keys: ${Object.keys(data.face2face_result).join(', ')}`);
          this.logger.log(`face2face_result (no photos): ${JSON.stringify(this.stripBase64(data.face2face_result))}`);
        }
        this.logger.log(`=== END RESULT ===`);

        // Check if results are populated
        const readyStatus = this.getReadyStatus(data);
        this.logger.log(`Ready status: ${readyStatus.status} — ${readyStatus.detail}`);

        if (readyStatus.status === 'ready') {
          this.logger.log(`Results ready after ${attempt} attempt(s)`);
          return data;
        }

        if (readyStatus.status === 'failed') {
          // Explicit failure — no need to retry
          this.logger.warn(`Explicit failure detected: ${readyStatus.detail}`);
          return data;
        }

        // Status is 'pending' — results not ready yet
        if (attempt < maxAttempts) {
          this.logger.warn(`Results not ready yet. Polling again in ${delayMs / 1000}s...`);
          await this.delay(delayMs);
          continue;
        }

      } catch (error: any) {
        this.logger.error(`Fetch failed (attempt ${attempt}): ${error.message}`, error.response?.data);

        if (attempt < maxAttempts) {
          await this.delay(delayMs);
          continue;
        }

        throw new Error(`Failed to get biometric session result: ${error.response?.data?.message || error.message}`);
      }
    }

    // Exhausted all attempts — return whatever we have
    if (lastData) {
      this.logger.error(`Results still not fully populated after ${maxAttempts} attempts (~${(initialDelay + maxAttempts * delayMs) / 1000}s total). Returning last response.`);
      return lastData;
    }

    throw new Error('Failed to get biometric session result after all retries');
  }

  /**
   * Determine if the result is ready, pending, or explicitly failed.
   * Uses the top-level `status` and `flow_session_result` fields
   * which are the definitive indicators from the API.
   */
  private getReadyStatus(data: BiometricResultResponse): { status: 'ready' | 'pending' | 'failed'; detail: string } {
    // Primary check: top-level status field
    if (data.status === 'FINISHED') {
      if (data.flow_session_result === true) {
        return { status: 'ready', detail: `status=FINISHED, flow_session_result=true` };
      }
      if (data.flow_session_result === false) {
        const reasons = data.flow_session_failure_reasons?.join(', ') || 'unknown';
        return { status: 'failed', detail: `status=FINISHED but flow_session_result=false. Reasons: ${reasons}` };
      }
    }

    // If status is PROGRESS or similar, still processing
    if (data.status && data.status !== 'FINISHED') {
      return { status: 'pending', detail: `status=${data.status}` };
    }

    // Fallback: check if result objects have data
    const livenessKeys = data.liveness_result ? Object.keys(data.liveness_result).length : 0;
    const edocKeys = data.edocument_result ? Object.keys(data.edocument_result).length : 0;
    const f2fKeys = data.face2face_result ? Object.keys(data.face2face_result).length : 0;

    if (livenessKeys === 0 && edocKeys === 0 && f2fKeys === 0) {
      return { status: 'pending', detail: `All results empty, no status field` };
    }

    // Data present but no status field — treat as ready (old API format?)
    return { status: 'ready', detail: `No status field but data present (l:${livenessKeys}, e:${edocKeys}, f:${f2fKeys})` };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate the biometric result.
   * 
   * First checks the top-level flow_session_result (most reliable).
   * Then extracts user data from edocument_result, trying multiple
   * possible field names since the API may use different names.
   */
  validateResult(result: BiometricResultResponse): {
    valid: boolean;
    reason?: string;
    iin?: string;
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    phone?: string;
  } {
    this.logger.log('Validating biometric result...');

    // 1. Check top-level flow result (most reliable indicator)
    if (result.flow_session_result === false) {
      const reasons = result.flow_session_failure_reasons?.join(', ') || 'Unknown';
      this.logger.warn(`Flow session failed. Reasons: ${reasons}`);
      return { valid: false, reason: `Верификация не пройдена: ${reasons}` };
    }

    if (result.flow_session_result === true) {
      this.logger.log('flow_session_result = true — verification passed!');
    }

    // 2. Check liveness
    // API fields: result (bool), prediction (string), face_direction, eye_closed
    if (result.liveness_result && Object.keys(result.liveness_result).length > 0) {
      const lr = result.liveness_result;
      const passed = lr.result ?? lr.is_alive ?? lr.face_detected;
      const score = lr.prediction ?? lr.score;
      this.logger.log(`Liveness: result=${passed}, prediction=${score}, face_direction=${lr.face_direction}`);

      if (passed === false) {
        return { valid: false, reason: `Проверка живости не пройдена (prediction: ${score ?? 'N/A'})` };
      }
    }

    // 3. Check face2face
    // API fields: result (bool), prediction (string), prediction_percent (string)
    if (result.face2face_result && Object.keys(result.face2face_result).length > 0) {
      const f2f = result.face2face_result;
      const passed = f2f.result ?? f2f.is_match;
      const score = f2f.prediction ?? f2f.score;
      this.logger.log(`Face2Face: result=${passed}, prediction=${score} (${f2f.prediction_percent}%)`);

      if (passed === false) {
        return { valid: false, reason: `Сличение лица не пройдено (prediction: ${score ?? 'N/A'})` };
      }
    }

    // 4. Extract IIN from edocument (try multiple possible field names)
    if (!result.edocument_result || Object.keys(result.edocument_result).length === 0) {
      this.logger.warn('No edocument_result data');
      // If flow_session_result is true, this shouldn't happen but handle gracefully
      if (result.flow_session_result === true) {
        return { valid: false, reason: 'Данные eGov не получены, но верификация прошла. Обратитесь к администратору.' };
      }
      return { valid: false, reason: 'Верификация через eGov не завершена' };
    }

    const edoc = result.edocument_result;
    this.logger.log(`EDocument fields: ${Object.keys(edoc).join(', ')}`);

    // The EDocument result has a deeply nested structure:
    // edocument_result.result_json.common.docOwner.iin
    // edocument_result.result_json.common.docOwner.firstName
    // edocument_result.result_json.common.docOwner.lastName
    // edocument_result.result_json.common.docOwner.middleName
    // edocument_result.phone (top-level)
    const docOwner = edoc.result_json?.common?.docOwner;

    if (docOwner) {
      this.logger.log(`docOwner found: iin=${docOwner.iin}, lastName=${docOwner.lastName}, firstName=${docOwner.firstName}, middleName=${docOwner.middleName}`);
    } else {
      this.logger.warn(`docOwner not found in result_json. result_json keys: ${edoc.result_json ? Object.keys(edoc.result_json).join(', ') : 'N/A'}`);
    }

    // Extract from nested docOwner, fallback to top-level fields
    const iin = docOwner?.iin || edoc.iin || edoc.personal_number;
    const firstName = docOwner?.firstName || edoc.first_name || edoc.firstName;
    const lastName = docOwner?.lastName || edoc.last_name || edoc.lastName;
    const patronymic = docOwner?.middleName || edoc.patronymic || edoc.middle_name;
    const phone = edoc.phone || edoc.phone_number;

    this.logger.log(`Extracted: iin=${iin}, firstName=${firstName}, lastName=${lastName}, patronymic=${patronymic}, phone=${phone}`);

    if (!iin) {
      // Log ALL edocument fields to help debug
      const edocSafe = this.stripBase64(edoc);
      this.logger.error(`Could not find IIN in any known field. All edocument data: ${JSON.stringify(edocSafe)}`);
      return { valid: false, reason: 'ИИН не найден в результате верификации. Обратитесь к администратору.' };
    }

    this.logger.log(`Validation PASSED! IIN: ${iin}, Name: ${lastName} ${firstName}`);

    return {
      valid: true,
      iin: String(iin),
      firstName: firstName ? String(firstName) : undefined,
      lastName: lastName ? String(lastName) : undefined,
      patronymic: patronymic ? String(patronymic) : undefined,
      phone: phone ? String(phone) : undefined,
    };
  }

  /**
   * Strip base64-encoded data from an object for safe logging.
   * Any string value longer than 200 chars is likely base64 photo/document data.
   */
  private stripBase64(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.length > 200) {
        result[key] = `[base64/long string, ${value.length} chars]`;
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
