import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../persistence/entities/user.entity';
import { Organization } from '../../persistence/entities/organization.entity';
import { CertificateInfo } from '../ecdsa/certificate-parser.service';

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
   * Найти или создать пользователя по сертификату
   */
  async findOrCreateByCertificate(certInfo: CertificateInfo): Promise<User> {
    // 1. Найти пользователя по serial number сертификата
    let user = await this.userRepo.findOne({
      where: { certificateSerial: certInfo.serialNumber },
      relations: ['organization', 'roles'],
    });

    if (user) {
      // Обновить информацию о сертификате
      user.certificateSerial = certInfo.serialNumber;
      user.email = certInfo.subject.email || user.email;
      user.displayName = this.getDisplayName(certInfo);
      user.certificateSubject = certInfo.subject as any;
      user.certificateIssuer = certInfo.issuer as any;
      user.certificateValidFrom = certInfo.validFrom;
      user.certificateValidTo = certInfo.validTo;
      await this.userRepo.save(user);
      return user;
    }

    // 2. Определить организацию
    const organization = await this.determineOrganization(certInfo);

    // 3. Создать нового пользователя
    user = this.userRepo.create({
      email: certInfo.subject.email || `${certInfo.serialNumber}@cert.kz`,
      displayName: this.getDisplayName(certInfo),
      certificateSerial: certInfo.serialNumber,
      certificateSubject: certInfo.subject as any,
      certificateIssuer: certInfo.issuer as any,
      certificateValidFrom: certInfo.validFrom,
      certificateValidTo: certInfo.validTo,
      organization: organization,
    });

    await this.userRepo.save(user);

    return user;
  }

  private getDisplayName(certInfo: CertificateInfo): string {
    if (certInfo.subject.organizationName) {
      // Юридическое лицо
      return certInfo.subject.organizationName;
    } else {
      // Физическое лицо
      const parts = [
        certInfo.subject.surname,
        certInfo.subject.givenName,
      ].filter(Boolean);
      return parts.join(' ') || certInfo.subject.commonName || 'Unknown';
    }
  }

  private async determineOrganization(
    certInfo: CertificateInfo,
  ): Promise<Organization> {
    // 1. Если есть БИН, найти организацию по БИН
    if (certInfo.subject.bin) {
      const org = await this.orgRepo.findOne({
        where: { bin: certInfo.subject.bin },
      });
      if (org) {
        this.logger.log(`Found organization by BIN: ${org.name}`);
        return org;
      }
    }

    // 2. Если есть organizationName, найти по имени
    if (certInfo.subject.organizationName) {
      const org = await this.orgRepo.findOne({
        where: { name: certInfo.subject.organizationName },
      });
      if (org) {
        this.logger.log(`Found organization by name: ${org.name}`);
        return org;
      }
    }

    // 3. Найти организацию по email домену
    if (certInfo.subject.email) {
      const emailDomain = certInfo.subject.email.split('@')[1];
      const org = await this.orgRepo.findOne({
        where: { emailDomain: emailDomain },
      });
      if (org) {
        this.logger.log(`Found organization by email domain: ${org.name}`);
        return org;
      }
    }

    // 4. Использовать первую доступную организацию или создать default
    const defaultOrg = await this.orgRepo.findOne({
      where: { slug: 'demo-bank' }, // Используем существующую организацию
    });

    if (defaultOrg) {
      this.logger.log(`Using default organization: ${defaultOrg.name}`);
      return defaultOrg;
    }

    // 5. Если ничего не найдено, выбрасываем ошибку
    throw new Error('Organization not found. Please contact administrator.');
  }
}

