import { DataSource } from 'typeorm';
import { Organization } from './src/persistence/entities/organization.entity';
import { User } from './src/persistence/entities/user.entity';
import { RoleAssignment } from './src/persistence/entities/role-assignment.entity';
import { X509Cert } from './src/persistence/entities/x509cert.entity';
import { PrivacyGroup } from './src/persistence/entities/privacy-group.entity';
import { ContractInterface } from './src/persistence/entities/contract-interface.entity';
import { ContractListener } from './src/persistence/entities/contract-listener.entity';
import { TokenPool } from './src/persistence/entities/token-pool.entity';
import { AssetFile } from './src/persistence/entities/asset-file.entity';
import { SolanaAsset } from './src/persistence/entities/solana-asset.entity';
import { AuditEvent } from './src/persistence/entities/audit-event.entity';
import { RelayCheckpoint } from './src/persistence/entities/relay-checkpoint.entity';
import { ProcessedEvent } from './src/persistence/entities/processed-event.entity';
import { Init1700000000000 } from './src/migrations/1700000000000-init';
import { AddFireflyUrl1700000000001 } from './src/migrations/1700000000001-add-firefly-url';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
  username: process.env.POSTGRES_USER || 'kaz',
  password: process.env.POSTGRES_PASSWORD || 'kazpass',
  database: process.env.POSTGRES_DB || 'kazsmartchain',
  entities: [
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
  ],
  migrations: [Init1700000000000, AddFireflyUrl1700000000001],
});

