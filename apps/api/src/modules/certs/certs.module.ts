import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { X509Cert } from '../../persistence/entities/x509cert.entity';
import { CertsController } from './certs.controller';
import { CertsService } from './certs.service';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [TypeOrmModule.forFeature([X509Cert]), AuthModule, RbacModule, OrgsModule],
  controllers: [CertsController],
  providers: [CertsService],
})
export class CertsModule {}

