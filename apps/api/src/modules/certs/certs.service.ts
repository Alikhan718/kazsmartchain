import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { X509Cert } from '../../persistence/entities/x509cert.entity';
import * as crypto from 'crypto';
import { OrgsService } from '../orgs/orgs.service';

@Injectable()
export class CertsService {
  constructor(
    @InjectRepository(X509Cert) private readonly repo: Repository<X509Cert>,
    private readonly orgs: OrgsService,
  ) {}

  async upload(organizationId: string, pem: string) {
    const fingerprint = crypto.createHash('sha256').update(pem).digest('hex');
    const org = await this.orgs.resolve(organizationId);
    
    // Парсим сертификат для извлечения дат
    let notBefore: Date | undefined;
    let notAfter: Date | undefined;
    try {
      const cert = new crypto.X509Certificate(pem);
      notBefore = cert.validFrom ? new Date(cert.validFrom) : undefined;
      notAfter = cert.validTo ? new Date(cert.validTo) : undefined;
    } catch {
      // Если не удалось распарсить, оставляем undefined
    }
    
    const record = this.repo.create({ organization: org, pem, fingerprint, active: true, notBefore, notAfter });
    return this.repo.save(record);
  }

  async list(organizationId: string) {
    const org = await this.orgs.resolve(organizationId);
    return this.repo.find({ where: { organization: { id: org.id } as any }, order: { createdAt: 'DESC' } });
  }

  async toggleActive(organizationId: string, certId: string) {
    const org = await this.orgs.resolve(organizationId);
    const cert = await this.repo.findOneOrFail({ where: { id: certId, organization: { id: org.id } as any } });
    cert.active = !cert.active;
    return this.repo.save(cert);
  }
}

