import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolanaAsset } from '../../persistence/entities/solana-asset.entity';
import { AuditService } from '../audit/audit.service';
import { OrgsService } from '../orgs/orgs.service';

type MintResult = { mint: string; uri: string };

@Injectable()
export class SolanaService {
  constructor(
    @InjectRepository(SolanaAsset) private readonly repo: Repository<SolanaAsset>,
    private readonly audit: AuditService,
    private readonly orgs: OrgsService,
  ) {}

  private custodialEnabled(): boolean {
    return !!process.env.SOLANA_CUSTODIAL_KEYPAIR_PATH;
  }

  async mint(opts: {
    organizationId: string;
    uri: string;
    besuTxHash?: string;
    signerPolicy: 'custodial' | 'user';
    userWallet?: string;
  }): Promise<MintResult> {
    // In mocks, generate deterministic mint address
    const mint = 'Mint' + Math.random().toString(36).slice(2, 10);
    const org = await this.orgs.resolve(opts.organizationId);
    const record = this.repo.create({
      organization: org,
      mint,
      uri: opts.uri,
      besuTxHash: opts.besuTxHash,
      status: 'issued',
    });
    await this.repo.save(record);
    await this.audit.log({
      organization: { id: org.id } as any,
      eventType: 'solana.mint',
      signer: opts.signerPolicy === 'custodial' ? 'custodial' : `wallet:${opts.userWallet ?? 'unknown'}`,
      details: { mint, uri: opts.uri, besuTxHash: opts.besuTxHash },
    });
    return { mint, uri: opts.uri };
  }

  async updateMetadata(opts: { organizationId: string; mint: string; uri: string; besuTxHash?: string }) {
    const asset = await this.repo.findOneOrFail({ where: { mint: opts.mint } });
    asset.uri = opts.uri;
    asset.besuTxHash = opts.besuTxHash;
    asset.status = 'updated';
    await this.repo.save(asset);
    await this.audit.log({
      organization: { id: (await this.orgs.resolve(opts.organizationId)).id } as any,
      eventType: 'solana.update',
      signer: 'custodial',
      details: { mint: asset.mint, uri: asset.uri },
    });
    return asset;
  }

  async revoke(opts: { organizationId: string; mint: string; besuTxHash?: string }) {
    const asset = await this.repo.findOneOrFail({ where: { mint: opts.mint } });
    asset.status = 'revoked';
    asset.besuTxHash = opts.besuTxHash;
    await this.repo.save(asset);
    await this.audit.log({
      organization: { id: (await this.orgs.resolve(opts.organizationId)).id } as any,
      eventType: 'solana.revoke',
      signer: 'custodial',
      details: { mint: asset.mint },
    });
    return asset;
  }

  async getMetadata(mint: string) {
    const asset = await this.repo.findOne({ where: { mint } });
    if (!asset) return null;
    return { mint: asset.mint, uri: asset.uri, status: asset.status, besuTxHash: asset.besuTxHash };
  }
}

