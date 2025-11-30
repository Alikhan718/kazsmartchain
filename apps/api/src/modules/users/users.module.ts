import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../persistence/entities/user.entity';
import { Organization } from '../../persistence/entities/organization.entity';
import { RoleAssignment } from '../../persistence/entities/role-assignment.entity';
import { UserService } from './users.service';
import { RoleAssignmentService } from './role-assignment.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, RoleAssignment])],
  providers: [UserService, RoleAssignmentService],
  exports: [UserService, RoleAssignmentService],
})
export class UsersModule {}

