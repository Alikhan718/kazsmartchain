import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RefreshToken } from '../../persistence/entities/refresh-token.entity';
import { BiometricService } from '../biometric/biometric.service';
import { UserService } from '../users/users.service';
import { RoleAssignmentService } from '../users/role-assignment.service';
import { User } from '../../persistence/entities/user.entity';

export type AuthUser = {
  userId: string;
  tenantId: string;
  roles: string[];
  email: string;
  iin?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly biometric: BiometricService,
    private readonly users: UserService,
    private readonly roleAssignment: RoleAssignmentService,
  ) {}

  /**
   * Создание биометрической сессии
   */
  async createBiometricSession(): Promise<{ sessionId: string; technologies: string[] }> {
    const result = await this.biometric.createSession();
    return {
      sessionId: result.session_id,
      technologies: result.technologies,
    };
  }

  /**
   * Верификация биометрической сессии и аутентификация пользователя
   */
  async loginWithBiometric(
    sessionId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // 1. Получить результат верификации от Biometric.kz
    const result = await this.biometric.getSessionResult(sessionId);

    // 2. Валидировать результат
    const validation = this.biometric.validateResult(result);

    if (!validation.valid) {
      this.logger.warn(`Biometric verification failed for session ${sessionId}: ${validation.reason}`);
      throw new UnauthorizedException(`Биометрическая верификация не пройдена: ${validation.reason}`);
    }

    this.logger.log(`Biometric verification passed for session ${sessionId}, IIN: ${validation.iin}`);

    // 3. Найти или создать пользователя по ИИН
    const user = await this.users.findOrCreateByBiometric({
      iin: validation.iin!,
      firstName: validation.firstName,
      lastName: validation.lastName,
      patronymic: validation.patronymic,
      phone: validation.phone,
      sessionId: sessionId,
    });

    // 4. Назначить роль если нужно
    await this.roleAssignment.assignRoleByBiometric(user);

    // 5. Загрузить пользователя с ролями
    const userWithRoles = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['organization', 'roles'],
    });

    if (!userWithRoles) {
      throw new UnauthorizedException('User not found');
    }

    // 6. Сгенерировать JWT токены
    const roles = userWithRoles.roles.map(r => r.role);
    const authUser: AuthUser = {
      userId: userWithRoles.id,
      tenantId: userWithRoles.organization.id,
      roles: roles,
      email: userWithRoles.email,
      iin: userWithRoles.iin,
    };

    const accessToken = this.generateAccessToken(authUser);
    const refreshToken = await this.generateRefreshToken(userWithRoles, ipAddress, userAgent);

    this.logger.log(`User ${userWithRoles.id} logged in successfully via biometric verification (IIN: ${validation.iin})`);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        displayName: userWithRoles.displayName,
        iin: userWithRoles.iin,
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
      iin: tokenEntity.user.iin,
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
        iin: user.iin,
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
