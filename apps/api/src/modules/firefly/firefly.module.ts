import { Module } from '@nestjs/common';
import { FireFlyController } from './firefly.controller';
import { FireFlyService } from './firefly.service';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuditModule } from '../audit/audit.module';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [AuthModule, RbacModule, AuditModule, OrgsModule],
  controllers: [FireFlyController],
  providers: [FireFlyService],
  exports: [FireFlyService],
})
export class FireFlyModule {}

