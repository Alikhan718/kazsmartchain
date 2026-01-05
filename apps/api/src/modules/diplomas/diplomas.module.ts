import { Module } from '@nestjs/common';
import { DiplomasController } from './diplomas.controller';
import { DiplomasService } from './diplomas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diploma } from '../../persistence/entities/diploma.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { OrgsModule } from '../orgs/orgs.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { FireFlyModule } from '../firefly/firefly.module';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diploma]),
    AuditModule,
    AuthModule,
    RbacModule,
    OrgsModule,
    IpfsModule,
    FireFlyModule,
    SolanaModule,
  ],
  controllers: [DiplomasController],
  providers: [DiplomasService],
  exports: [DiplomasService],
})
export class DiplomasModule {}

