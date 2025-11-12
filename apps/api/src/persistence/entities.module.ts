import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { User } from './entities/user.entity';
import { RoleAssignment } from './entities/role-assignment.entity';
import { X509Cert } from './entities/x509cert.entity';
import { PrivacyGroup } from './entities/privacy-group.entity';
import { ContractInterface } from './entities/contract-interface.entity';
import { ContractListener } from './entities/contract-listener.entity';
import { TokenPool } from './entities/token-pool.entity';
import { AssetFile } from './entities/asset-file.entity';
import { SolanaAsset } from './entities/solana-asset.entity';
import { AuditEvent } from './entities/audit-event.entity';
import { RelayCheckpoint } from './entities/relay-checkpoint.entity';
import { ProcessedEvent } from './entities/processed-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      User,
      RoleAssignment,
      X509Cert,
      PrivacyGroup,
      ContractInterface,
      ContractListener,
      TokenPool,
      AssetFile,
      SolanaAsset,
      AuditEvent,
      RelayCheckpoint,
      ProcessedEvent,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}

