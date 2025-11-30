import { Module } from '@nestjs/common';
import { ECDSAService } from './ecdsa.service';
import { CertificateParser } from './certificate-parser.service';
import { PHPBridgeService } from './php-bridge.service';

@Module({
  providers: [ECDSAService, CertificateParser, PHPBridgeService],
  exports: [ECDSAService, CertificateParser],
})
export class ECDSAModule {}

