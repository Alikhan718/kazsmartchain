import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { RolesGuard } from './roles.guard';
import { TenantGuard } from './tenant.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [RbacService, RolesGuard, TenantGuard],
  controllers: [RbacController],
  exports: [RbacService, RolesGuard, TenantGuard],
})
export class RbacModule {}

