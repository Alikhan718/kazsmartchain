import { API_BASE } from '../env';

export interface BiometricSessionResponse {
  sessionId: string;
  technologies: string[];
}

export interface BiometricVerifyResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    iin: string;
    roles: string[];
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

class AuthAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE}/api/auth`;
  }

  /**
   * Создать сессию биометрической верификации
   */
  async createBiometricSession(): Promise<BiometricSessionResponse> {
    const response = await fetch(`${this.baseUrl}/biometric/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка создания сессии верификации' }));
      throw new Error(error.message || 'Ошибка создания сессии верификации');
    }

    return response.json();
  }

  /**
   * Подтвердить биометрическую сессию и получить токены.
   * Backend polls Biometric.kz for results (up to ~33s), so we need
   * a longer timeout via AbortController.
   */
  async verifyBiometricSession(sessionId: string): Promise<BiometricVerifyResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch(`${this.baseUrl}/biometric/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Ошибка верификации' }));
        throw new Error(error.message || 'Ошибка верификации');
      }

      return response.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Превышено время ожидания результата верификации. Попробуйте ещё раз.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Обновление access token через refresh token
   */
  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка обновления токена' }));
      throw new Error(error.message || 'Ошибка обновления токена');
    }

    return response.json();
  }
}

export const authAPI = new AuthAPI();
