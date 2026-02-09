import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../persistence/entities/user.entity';
import { Organization } from '../../persistence/entities/organization.entity';

export interface BiometricUserInfo {
  iin: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  phone?: string;
  sessionId: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  /**
   * Найти или создать пользователя по результату биометрической верификации
   */
  async findOrCreateByBiometric(info: BiometricUserInfo): Promise<User> {
    // 1. Найти пользователя по ИИН
    let user = await this.userRepo.findOne({
      where: { iin: info.iin },
      relations: ['organization', 'roles'],
    });

    if (user) {
      // Обновить информацию о пользователе
      user.displayName = this.getDisplayNameFromBiometric(info) || user.displayName;
      user.phone = info.phone || user.phone;
      user.biometricVerified = true;
      user.biometricSessionId = info.sessionId;
      await this.userRepo.save(user);
      this.logger.log(`Updated existing user ${user.id} by IIN ${info.iin}`);
      return user;
    }

    // 2. Определить организацию
    const organization = await this.determineOrganizationByIIN(info.iin);

    // 3. Создать нового пользователя
    user = this.userRepo.create({
      email: `${info.iin}@biometric.kz`,
      displayName: this.getDisplayNameFromBiometric(info),
      iin: info.iin,
      phone: info.phone,
      biometricVerified: true,
      biometricSessionId: info.sessionId,
      organization: organization,
    });

    await this.userRepo.save(user);
    this.logger.log(`Created new user ${user.id} by IIN ${info.iin}`);

    return user;
  }

  private getDisplayNameFromBiometric(info: BiometricUserInfo): string {
    const parts = [
      info.lastName,
      info.firstName,
      info.patronymic,
    ].filter(Boolean);
    return parts.join(' ') || `User ${info.iin}`;
  }

  private async determineOrganizationByIIN(iin: string): Promise<Organization> {
    // 1. Использовать первую доступную организацию (demo-bank)
    const defaultOrg = await this.orgRepo.findOne({
      where: { slug: 'demo-bank' },
    });

    if (defaultOrg) {
      this.logger.log(`Using default organization: ${defaultOrg.name}`);
      return defaultOrg;
    }

    // 2. Если ничего не найдено, выбрасываем ошибку
    throw new Error('Organization not found. Please contact administrator.');
  }
}

