import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleAssignment, Role } from '../../persistence/entities/role-assignment.entity';
import { User } from '../../persistence/entities/user.entity';
import { Organization } from '../../persistence/entities/organization.entity';
import { CertificateInfo } from '../ecdsa/certificate-parser.service';

@Injectable()
export class RoleAssignmentService {
  private readonly logger = new Logger(RoleAssignmentService.name);

  constructor(
    @InjectRepository(RoleAssignment)
    private readonly roleRepo: Repository<RoleAssignment>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  /**
   * Назначение роли пользователю по сертификату
   */
  async assignRoleByCertificate(
    user: User,
    certInfo: CertificateInfo,
  ): Promise<RoleAssignment> {
    // Проверяем, есть ли уже роль у пользователя
    const existingRole = await this.roleRepo.findOne({
      where: {
        user: { id: user.id } as any,
        organization: { id: user.organization.id } as any,
      },
    });

    if (existingRole) {
      this.logger.log(`User ${user.id} already has role ${existingRole.role}`);
      return existingRole;
    }

    // Определяем роль по сертификату
    let role: Role = 'Operator';

    // 1. Проверить БИН организации
    if (certInfo.subject.bin && user.organization.bin) {
      if (certInfo.subject.bin === user.organization.bin) {
        // Сертификат принадлежит организации
        role = 'OrgAdmin';
        this.logger.log(`Assigned OrgAdmin role based on BIN match`);
      }
    }

    // 2. Проверить email домен
    if (certInfo.subject.email && user.organization.emailDomain) {
      const emailDomain = certInfo.subject.email.split('@')[1];
      if (emailDomain === user.organization.emailDomain) {
        role = 'OrgAdmin';
        this.logger.log(`Assigned OrgAdmin role based on email domain match`);
      }
    }

    // 3. Если это юридическое лицо и организация совпадает
    if (certInfo.subject.organizationName && user.organization.name) {
      if (certInfo.subject.organizationName === user.organization.name) {
        role = 'OrgAdmin';
        this.logger.log(`Assigned OrgAdmin role based on organization name match`);
      }
    }

    // 4. Создать назначение роли
    const roleAssignment = this.roleRepo.create({
      user: user,
      organization: user.organization,
      role: role,
    });

    const saved = await this.roleRepo.save(roleAssignment);
    this.logger.log(`Assigned role ${role} to user ${user.id} in organization ${user.organization.id}`);
    
    return saved;
  }
}

