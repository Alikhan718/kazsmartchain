import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../persistence/entities/organization.entity';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class OrgsService {
  constructor(@InjectRepository(Organization) private readonly repo: Repository<Organization>) {}

  async resolve(param: string): Promise<Organization> {
    if (UUID_RE.test(param)) {
      const byId = await this.repo.findOneOrFail({ where: { id: param } });
      return byId;
    }
    const bySlug = await this.repo.findOneOrFail({ where: { slug: param } });
    return bySlug;
  }
}


