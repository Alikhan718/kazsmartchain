import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditEvent } from '../../persistence/entities/audit-event.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEvent]), AuthModule, RbacModule, OrgsModule],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}

