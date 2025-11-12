import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from '../../persistence/entities/audit-event.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditEvent) private readonly repo: Repository<AuditEvent>) {}

  async log(event: Partial<AuditEvent>) {
    const e = this.repo.create(event);
    return this.repo.save(e);
  }

  search(opts: { tenantId?: string; userId?: string; type?: string }) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').limit(200);
    if (opts.tenantId) qb.andWhere('"organizationId" = :tenantId', { tenantId: opts.tenantId });
    if (opts.userId) qb.andWhere('"userId" = :userId', { userId: opts.userId });
    if (opts.type) qb.andWhere('"eventType" = :type', { type: opts.type });
    return qb.getMany();
  }
}

