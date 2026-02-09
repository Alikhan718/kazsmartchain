import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleAssignment, Role } from '../../persistence/entities/role-assignment.entity';
import { User } from '../../persistence/entities/user.entity';
import { Organization } from '../../persistence/entities/organization.entity';

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
   * Назначение роли пользователю после биометрической верификации
   */
  async assignRoleByBiometric(user: User): Promise<RoleAssignment> {
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

    // По умолчанию все биометрически верифицированные пользователи получают роль Operator
    const role: Role = 'Operator';

    // Создать назначение роли
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

