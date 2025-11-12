import { Module } from '@nestjs/common';
import { SolanaController } from './solana.controller';
import { SolanaService } from './solana.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolanaAsset } from '../../persistence/entities/solana-asset.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [TypeOrmModule.forFeature([SolanaAsset]), AuditModule, AuthModule, RbacModule, OrgsModule],
  controllers: [SolanaController],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}

