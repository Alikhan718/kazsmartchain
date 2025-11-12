import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [AuthModule, RbacModule],
  controllers: [NetworkController],
})
export class NetworkModule {}

