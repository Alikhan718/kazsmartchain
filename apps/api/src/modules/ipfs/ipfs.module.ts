import { Module } from '@nestjs/common';
import { IpfsController } from './ipfs.controller';
import { IpfsService } from './ipfs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetFile } from '../../persistence/entities/asset-file.entity';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [TypeOrmModule.forFeature([AssetFile]), AuthModule, RbacModule, OrgsModule],
  controllers: [IpfsController],
  providers: [IpfsService],
  exports: [IpfsService],
})
export class IpfsModule {}

