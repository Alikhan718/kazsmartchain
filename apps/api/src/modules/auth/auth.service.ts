import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthChallenge } from '../../persistence/entities/auth-challenge.entity';
import { RefreshToken } from '../../persistence/entities/refresh-token.entity';
import { ECDSAService } from '../ecdsa/ecdsa.service';
import { UserService } from '../users/users.service';
import { RoleAssignmentService } from '../users/role-assignment.service';
import { User } from '../../persistence/entities/user.entity';

export type AuthUser = {
  userId: string;
  tenantId: string;
  roles: string[];
  email: string;
  certificateSerial?: string;
};

export interface LoginRequest {
  certificate: string; // PEM сертификат в Base64 или прямой PEM
  signature: string; // CMS подпись в Base64
  nonce: string;
  data: string; // Данные которые были подписаны (Base64)
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(AuthChallenge)
    private readonly challengeRepo: Repository<AuthChallenge>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly ecdsa: ECDSAService,
    private readonly users: UserService,
    private readonly roleAssignment: RoleAssignmentService,
  ) {}

  /**
   * Генерация challenge для подписи
   */
  async generateChallenge(ipAddress?: string, userAgent?: string): Promise<{ challenge: string; nonce: string }> {
    const nonce = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    const challenge = `KazSmartChain Login Challenge: ${nonce}:${timestamp}`;
    
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    const challengeEntity = this.challengeRepo.create({
      nonce,
      challenge,
      expiresAt,
      ipAddress,
      userAgent,
    });

    await this.challengeRepo.save(challengeEntity);

    this.logger.log(`Generated challenge for nonce: ${nonce.substring(0, 8)}...`);

    return { challenge, nonce };
  }

  /**
   * Аутентификация с ЭЦП
   */
  async loginWithECDSA(
    request: LoginRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // 1. Проверить challenge
    const challengeEntity = await this.challengeRepo.findOne({
      where: { nonce: request.nonce },
    });

    if (!challengeEntity) {
      throw new UnauthorizedException('Invalid challenge nonce');
    }

    if (challengeEntity.used) {
      throw new UnauthorizedException('Challenge already used');
    }

    if (challengeEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Challenge expired');
    }

    // 2. Проверить подпись
    // request.data должен быть в Base64 (как было подписано)
    // request.signature - это CMS подпись в Base64
    // request.certificate - это PEM сертификат (может быть обрезанным, тогда извлекаем из подписи)
    
    this.logger.debug(`Verifying signature: cert length=${request.certificate?.length || 0}, data length=${request.data?.length || 0}, signature length=${request.signature?.length || 0}`);
    this.logger.debug(`Certificate preview: ${request.certificate?.substring(0, 100)}...`);
    this.logger.debug(`Data preview: ${request.data?.substring(0, 50)}...`);
    this.logger.debug(`Signature preview: ${request.signature?.substring(0, 50)}...`);
    
    // Проверяем что все данные присутствуют
    if (!request.data || !request.signature) {
      this.logger.warn('Missing required data for signature verification');
      challengeEntity.used = true;
      challengeEntity.usedAt = new Date();
      await this.challengeRepo.save(challengeEntity);
      throw new UnauthorizedException('Missing data or signature');
    }
    
    // Если сертификат обрезан (меньше 50 символов), пытаемся извлечь его из CMS подписи
    let certificate = request.certificate;
    if (!certificate || certificate.length < 50) {
      this.logger.warn(`Certificate too short (${certificate?.length || 0} chars), attempting to extract from CMS signature`);
      try {
        const extractedCert = await this.ecdsa.extractCertificateFromSignature(request.signature);
        if (extractedCert && extractedCert.length > 50) {
          this.logger.log(`Successfully extracted certificate from CMS signature (${extractedCert.length} chars)`);
          certificate = extractedCert;
        } else {
          this.logger.warn(`Failed to extract certificate from signature, using provided certificate`);
        }
      } catch (extractError: any) {
        this.logger.warn(`Error extracting certificate from signature: ${extractError.message}`);
        // Продолжаем с предоставленным сертификатом
      }
    }
    
    if (!certificate || certificate.length < 50) {
      this.logger.warn('Certificate still too short after extraction attempt');
      challengeEntity.used = true;
      challengeEntity.usedAt = new Date();
      await this.challengeRepo.save(challengeEntity);
      throw new UnauthorizedException('Invalid certificate: too short');
    }
    
    const isValid = await this.ecdsa.verifySignature(
      certificate,
      request.data, // Данные в Base64 которые были подписаны
      request.signature, // CMS подпись в Base64
    );

    if (!isValid) {
      this.logger.warn('Signature verification failed');
      // Отметить challenge как использованный даже при ошибке
      challengeEntity.used = true;
      challengeEntity.usedAt = new Date();
      await this.challengeRepo.save(challengeEntity);
      
      throw new UnauthorizedException('Invalid signature');
    }
    
    this.logger.log('Signature verified successfully');

    // 3. Извлечь информацию из сертификата (используем извлеченный если был обрезан)
    const certInfo = await this.ecdsa.extractCertificateInfo(certificate);

    // 4. Найти или создать пользователя
    const user = await this.users.findOrCreateByCertificate(certInfo);

    // 5. Назначить роль если нужно
    await this.roleAssignment.assignRoleByCertificate(user, certInfo);

    // 6. Загрузить пользователя с ролями
    const userWithRoles = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['organization', 'roles'],
    });

    if (!userWithRoles) {
      throw new UnauthorizedException('User not found');
    }

    // 7. Отметить challenge как использованный
    challengeEntity.used = true;
    challengeEntity.usedAt = new Date();
    await this.challengeRepo.save(challengeEntity);

    // 8. Сгенерировать JWT токены
    const roles = userWithRoles.roles.map(r => r.role);
    const authUser: AuthUser = {
      userId: userWithRoles.id,
      tenantId: userWithRoles.organization.id,
      roles: roles,
      email: userWithRoles.email,
      certificateSerial: userWithRoles.certificateSerial,
    };

    const accessToken = this.generateAccessToken(authUser);
    const refreshToken = await this.generateRefreshToken(userWithRoles, ipAddress, userAgent);

    this.logger.log(`User ${userWithRoles.id} logged in successfully with certificate ${certInfo.serialNumber}`);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        displayName: userWithRoles.displayName,
        roles: roles,
        organization: {
          id: userWithRoles.organization.id,
          name: userWithRoles.organization.name,
          slug: userWithRoles.organization.slug,
        },
      },
    };
  }

  /**
   * Обновление access token через refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    const tokenEntity = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
      relations: ['user', 'user.organization', 'user.roles'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenEntity.revoked) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const roles = tokenEntity.user.roles.map(r => r.role);
    const authUser: AuthUser = {
      userId: tokenEntity.user.id,
      tenantId: tokenEntity.user.organization.id,
      roles: roles,
      email: tokenEntity.user.email,
      certificateSerial: tokenEntity.user.certificateSerial,
    };

    const accessToken = this.generateAccessToken(authUser);

    return { accessToken };
  }

  /**
   * Проверка Bearer токена
   */
  verifyBearer(token?: string): AuthUser | null {
    if (!token) return null;
    
    try {
      // Поддержка dev токенов для разработки
      if (token.startsWith('dev:')) {
        const [, tenantId, role = 'OrgAdmin'] = token.split(':');
        return {
          userId: 'dev-user',
          tenantId,
          roles: [role],
          email: 'dev@example.com',
        };
      }

      const payload = this.jwt.verify(token);
      return payload as AuthUser;
    } catch (error) {
      this.logger.debug('Token verification failed', error);
      return null;
    }
  }

  private generateAccessToken(user: AuthUser): string {
    return this.jwt.sign(
      {
        userId: user.userId,
        tenantId: user.tenantId,
        roles: user.roles,
        email: user.email,
        certificateSerial: user.certificateSerial,
      },
      {
        expiresIn: '15m',
      },
    );
  }

  private async generateRefreshToken(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshToken> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

    const refreshTokenEntity = this.refreshTokenRepo.create({
      user: user,
      token: token,
      expiresAt: expiresAt,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    return await this.refreshTokenRepo.save(refreshTokenEntity);
  }
}

