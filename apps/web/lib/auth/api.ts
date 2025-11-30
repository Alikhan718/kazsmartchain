import { API_BASE } from '../env';

export interface ChallengeResponse {
  challenge: string;
  nonce: string;
  expiresAt: string;
}

export interface LoginRequest {
  certificate: string;
  signature: string;
  nonce: string;
  data: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    organization: {
      id: string;
      name: string;
    };
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
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
   * Получить challenge для подписи
   */
  async getChallenge(): Promise<ChallengeResponse> {
    const response = await fetch(`${this.baseUrl}/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка получения challenge' }));
      throw new Error(error.message || 'Ошибка получения challenge');
    }

    return response.json();
  }

  /**
   * Вход с ЭЦП
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // Логируем что отправляем
    console.log('Sending login request:', {
      certLength: request.certificate?.length || 0,
      certPreview: request.certificate?.substring(0, 100),
      signatureLength: request.signature?.length || 0,
      dataLength: request.data?.length || 0,
    });
    
    const jsonBody = JSON.stringify(request);
    console.log('JSON body length:', jsonBody.length);
    console.log('JSON body preview:', jsonBody.substring(0, 200));
    
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonBody,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка входа' }));
      throw new Error(error.message || 'Ошибка входа');
    }

    return response.json();
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

  /**
   * Проверка сертификата
   */
  async verifyCertificate(certificate: string): Promise<{ valid: boolean; info?: any }> {
    const response = await fetch(`${this.baseUrl}/verify-certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ certificate }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка проверки сертификата' }));
      throw new Error(error.message || 'Ошибка проверки сертификата');
    }

    return response.json();
  }
}

export const authAPI = new AuthAPI();

