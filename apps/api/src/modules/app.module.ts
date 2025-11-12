import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { AuditModule } from './audit/audit.module';
import { CertsModule } from './certs/certs.module';
import { FireFlyModule } from './firefly/firefly.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { SolanaModule } from './solana/solana.module';
import { RelayModule } from './relay/relay.module';
import { NetworkModule } from './network/network.module';
import { EntitiesModule } from '../persistence/entities.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
        username: process.env.POSTGRES_USER || 'kaz',
        password: process.env.POSTGRES_PASSWORD || 'kazpass',
        database: process.env.POSTGRES_DB || 'kazsmartchain',
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    EntitiesModule,
    HealthModule,
    MetricsModule,
    AuthModule,
    RbacModule,
    AuditModule,
    CertsModule,
    FireFlyModule,
    IpfsModule,
    SolanaModule,
    RelayModule,
    NetworkModule,
    RealtimeModule,
  ],
})
export class AppModule {}

