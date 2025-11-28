import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from '../../persistence/entities/audit-event.entity';
import { Organization } from '../../persistence/entities/organization.entity';

@Controller('test-data')
export class TestDataController {
  constructor(
    @InjectRepository(AuditEvent)
    private readonly auditRepo: Repository<AuditEvent>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  @Post('generate-transactions')
  async generateTestTransactions() {
    const bcc = await this.orgRepo.findOne({ where: { slug: 'bcc' } });
    const kaznu = await this.orgRepo.findOne({ where: { slug: 'kaznu' } });

    if (!bcc || !kaznu) {
      return { error: 'Organizations not found. Run seed first.' };
    }

    const events: Partial<AuditEvent>[] = [];

    // 1. BCC создает Token Pool для KZT Stablecoin
    events.push({
      organization: bcc,
      eventType: 'TOKEN_POOL_CREATE',
      details: {
        pool: 'KZT-Stablecoin',
        type: 'fungible',
        symbol: 'KZT',
        decimals: 2,
        hash: '0x' + Math.random().toString(16).slice(2, 66),
        status: 'success',
      },
      createdAt: new Date(Date.now() - 7200000), // 2 часа назад
    });

    // 2. BCC mint токенов
    events.push({
      organization: bcc,
      eventType: 'TOKEN_MINT',
      details: {
        pool: 'KZT-Stablecoin',
        amount: '1000000',
        to: bcc.slug,
        hash: '0x' + Math.random().toString(16).slice(2, 66),
        from: '0x0000000000000000000000000000000000000000',
        value: '1000000 KZT',
        status: 'success',
      },
      createdAt: new Date(Date.now() - 6900000),
    });

    // 3. BCC transfer токенов в КазНУ
    events.push({
      organization: bcc,
      eventType: 'TOKEN_TRANSFER',
      details: {
        pool: 'KZT-Stablecoin',
        amount: '50000',
        from: bcc.slug,
        to: kaznu.slug,
        hash: '0x' + Math.random().toString(16).slice(2, 66),
        value: '50000 KZT',
        status: 'success',
      },
      createdAt: new Date(Date.now() - 6600000),
    });

    // 4. КазНУ создает NFT Pool для дипломов
    events.push({
      organization: kaznu,
      eventType: 'NFT_POOL_CREATE',
      details: {
        pool: 'Digital-Diplomas',
        type: 'nonfungible',
        symbol: 'KZNDIP',
        hash: '0x' + Math.random().toString(16).slice(2, 66),
        status: 'success',
      },
      createdAt: new Date(Date.now() - 6300000),
    });

    // 5. КазНУ mint первого NFT диплома
    events.push({
      organization: kaznu,
      eventType: 'NFT_MINT',
      details: {
        pool: 'Digital-Diplomas',
        tokenId: '1',
        to: 'student-001',
        metadata: 'ipfs://QmExampleDiplomaMetadata123',
        hash: '0x' + Math.random().toString(16).slice(2, 66),
        from: '0x0000000000000000000000000000000000000000',
        value: 'Diploma #1',
        status: 'success',
      },
      createdAt: new Date(Date.now() - 6000000),
    });

    // 6-15. Больше транзакций для графиков
    for (let i = 0; i < 10; i++) {
      const org = i % 2 === 0 ? bcc : kaznu;
      events.push({
        organization: org,
        eventType: 'TOKEN_TRANSFER',
        details: {
          pool: 'KZT-Stablecoin',
          amount: String(Math.floor(Math.random() * 10000) + 1000),
          from: org.slug,
          to: i % 2 === 0 ? kaznu.slug : bcc.slug,
          hash: '0x' + Math.random().toString(16).slice(2, 66),
          value: `${Math.floor(Math.random() * 10000) + 1000} KZT`,
          status: 'success',
        },
        createdAt: new Date(Date.now() - (5400000 - i * 300000)),
      });
    }

    // Сохраняем все события
    await this.auditRepo.save(events);

    return {
      message: 'Test transactions generated successfully',
      count: events.length,
      summary: {
        tokenPools: 2,
        tokenMints: 1,
        tokenTransfers: 11,
        nftMints: 1,
        organizations: [bcc.name, kaznu.name],
      },
    };
  }

  @Post('clear-transactions')
  async clearTestTransactions() {
    await this.auditRepo.delete({});
    return { message: 'All audit events cleared' };
  }
}

