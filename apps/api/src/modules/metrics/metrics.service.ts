import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from '../../persistence/entities/audit-event.entity';
import { Organization } from '../../persistence/entities/organization.entity';
import axios from 'axios';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly fireflyUrl = process.env.FIREFLY_BASE_URL || 'http://firefly:5000';
  private readonly besuUrl = process.env.BESU_RPC_URL || 'http://besu:8545';
  private readonly solanaUrl = process.env.SOLANA_RPC_URL || 'http://solana:8899';

  constructor(
    @InjectRepository(AuditEvent)
    private auditRepo: Repository<AuditEvent>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
  ) {}

  /**
   * Получить глобальные метрики сети (для Superadmin)
   */
  async getNetworkMetrics() {
    try {
      // Besu block height
      const besuBlock = await this.getBesuBlockNumber();
      
      // Solana slot height
      const solanaSlot = await this.getSolanaSlotHeight();
      
      // FireFly status
      const fireflyStatus = await this.getFireFlyStatus();
      
      // Database metrics
      const totalOrgs = await this.orgRepo.count();
      const activeOrgs = await this.orgRepo.count({ where: { active: true } });
      
      // Transaction count (last 24h from audit logs)
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const txCount24h = await this.auditRepo
        .createQueryBuilder('event')
        .where('event.createdAt >= :since', { since: last24h })
        .andWhere("(event.eventType LIKE '%TRANSFER%' OR event.eventType LIKE '%MINT%' OR event.eventType LIKE '%TRANSACTION%')")
        .getCount();

      return {
        besu: {
          blockHeight: besuBlock,
          status: besuBlock > 0 ? 'healthy' : 'down',
        },
        solana: {
          slotHeight: solanaSlot,
          status: solanaSlot > 0 ? 'healthy' : 'down',
        },
        firefly: {
          status: fireflyStatus ? 'healthy' : 'down',
          namespace: fireflyStatus?.namespace?.name || 'default',
        },
        organizations: {
          total: totalOrgs,
          active: activeOrgs,
        },
        transactions: {
          last24h: txCount24h,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get network metrics', error);
      return {
        besu: { blockHeight: 0, status: 'unknown' },
        solana: { slotHeight: 0, status: 'unknown' },
        firefly: { status: 'unknown' },
        organizations: { total: 0, active: 0 },
        transactions: { last24h: 0 },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Получить метрики для конкретной организации
   */
  async getOrganizationMetrics(orgId: string) {
    try {
      const org = await this.orgRepo.findOne({ where: { id: orgId } });
      if (!org) {
        throw new Error(`Organization ${orgId} not found`);
      }

      // Транзакции организации за последние 24 часа
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const txCount24h = await this.auditRepo
        .createQueryBuilder('event')
        .leftJoin('event.organization', 'org')
        .where('org.id = :orgId', { orgId })
        .andWhere('event.createdAt >= :since', { since: last24h })
        .andWhere("(event.eventType LIKE '%TRANSFER%' OR event.eventType LIKE '%MINT%' OR event.eventType LIKE '%TRANSACTION%')")
        .getCount();

      // Контракты организации
      const contractsCount = await this.auditRepo
        .createQueryBuilder('event')
        .leftJoin('event.organization', 'org')
        .where('org.id = :orgId', { orgId })
        .andWhere("event.eventType = 'CONTRACT_DEPLOY'")
        .getCount();

      // Все события организации
      const totalEvents = await this.auditRepo
        .createQueryBuilder('event')
        .leftJoin('event.organization', 'org')
        .where('org.id = :orgId', { orgId })
        .getCount();

      return {
        organization: {
          id: org.id,
          name: org.name,
          type: org.type,
          status: org.status,
        },
        transactions: {
          last24h: txCount24h,
        },
        contracts: {
          total: contractsCount,
        },
        events: {
          total: totalEvents,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics for org ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Получить статистику транзакций по часам (для графиков)
   */
  async getTransactionsByHour(hours: number = 12, orgId?: string) {
    const data = [];
    const now = new Date();

    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      let query = this.auditRepo
        .createQueryBuilder('event')
        .where('event.createdAt >= :start', { start: hourStart })
        .andWhere('event.createdAt < :end', { end: hourEnd })
        .andWhere("(event.eventType LIKE '%TRANSFER%' OR event.eventType LIKE '%MINT%' OR event.eventType LIKE '%TRANSACTION%')");

      if (orgId) {
        query = query
          .leftJoin('event.organization', 'org')
          .andWhere('org.id = :orgId', { orgId });
      }

      const count = await query.getCount();

      data.push({
        hour: hourStart.getHours(),
        count,
        timestamp: hourStart,
      });
    }

    return data;
  }

  /**
   * Получить список валидаторов (mock для начала)
   */
  async getValidators() {
    // TODO: Получать реальные данные из Besu admin API (qbft_getValidatorsByBlockNumber)
    // Пока возвращаем реальные организации-валидаторы KazSmartChain
    return [
      {
        id: 'validator-nu',
        name: 'Назарбаевский Университет (НУ)',
        organization: 'nu',
        location: 'Almaty',
        status: 'active',
        uptime: 99.9,
        blocksProduced: 7148,
        address: '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
      },
      {
        id: 'validator-kaznu',
        name: 'КазНУ имени Аль-Фараби',
        organization: 'kaznu',
        location: 'Almaty',
        status: 'active',
        uptime: 99.8,
        blocksProduced: 7148,
        address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
      },
    ];
  }

  /**
   * Получить последние транзакции
   */
  async getRecentTransactions(limit: number = 20, orgId?: string) {
    let query = this.auditRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organization', 'org')
      .leftJoinAndSelect('event.user', 'user')
      .where("(event.eventType LIKE '%TRANSFER%' OR event.eventType LIKE '%MINT%' OR event.eventType LIKE '%TRANSACTION%')")
      .orderBy('event.createdAt', 'DESC')
      .limit(limit);

    if (orgId) {
      query = query.andWhere('org.id = :orgId', { orgId });
    }

    const events = await query.getMany();

    return events.map((event) => ({
      id: event.id,
      hash: event.details?.hash || '0x' + Math.random().toString(16).slice(2, 66),
      from: event.details?.from || event.user?.id || 'Unknown',
      to: event.details?.to || 'Contract',
      value: event.details?.value || '0',
      timestamp: event.createdAt,
      status: event.details?.status || 'success',
      organization: event.organization?.id || null,
    }));
  }

  // ==================== Helpers ====================

  private async getBesuBlockNumber(): Promise<number> {
    try {
      const response = await axios.post(
        this.besuUrl,
        {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        },
        { timeout: 5000 },
      );
      return parseInt(response.data.result, 16);
    } catch (error) {
      this.logger.error('Failed to get Besu block number', error);
      return 0;
    }
  }

  private async getSolanaSlotHeight(): Promise<number> {
    try {
      const response = await axios.post(
        this.solanaUrl,
        {
          jsonrpc: '2.0',
          method: 'getSlot',
          params: [],
          id: 1,
        },
        { timeout: 5000 },
      );
      return response.data.result || 0;
    } catch (error) {
      this.logger.error('Failed to get Solana slot height', error);
      return 0;
    }
  }

  private async getFireFlyStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.fireflyUrl}/api/v1/status`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get FireFly status', error);
      return null;
    }
  }

}

