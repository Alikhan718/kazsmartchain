import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetFile } from '../../persistence/entities/asset-file.entity';
import { OrgsService } from '../orgs/orgs.service';

@Injectable()
export class IpfsService {
  constructor(
    @InjectRepository(AssetFile) private readonly repo: Repository<AssetFile>,
    private readonly orgs: OrgsService,
  ) {}
  private base = process.env.IPFS_BASE_URL || 'http://localhost:5001';

  async upload(organizationId: string, file: Buffer, filename: string, mime: string) {
    // Mocked via HTTP form-data to IPFS API; actual implementation would stream
    const cid = 'bafy' + Math.random().toString(36).slice(2);
    const org = await this.orgs.resolve(organizationId);
    const record = this.repo.create({
      organization: org,
      ipfsCid: cid,
      filename,
      mime,
      pinned: false,
    });
    await this.repo.save(record);
    return { cid };
  }

  async list(organizationId: string) {
    const org = await this.orgs.resolve(organizationId);
    return this.repo.find({ where: { organization: { id: org.id } as any } });
  }

  async pin(cid: string) {
    // axios.post(`${this.base}/api/v0/pin/add?arg=${cid}`)
    return { pinned: true, cid };
  }

  async get(cid: string) {
    // const res = await axios.get(`${this.base}/api/v0/cat?arg=${cid}`, { responseType: 'arraybuffer' });
    const fake = Buffer.from(`mock content for ${cid}`, 'utf8');
    return fake;
  }
}

