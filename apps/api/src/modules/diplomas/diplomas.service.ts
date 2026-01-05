import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diploma, DiplomaStatus } from '../../persistence/entities/diploma.entity';
import { AuditService } from '../audit/audit.service';
import { OrgsService } from '../orgs/orgs.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { FireFlyService } from '../firefly/firefly.service';
import { SolanaService } from '../solana/solana.service';
import * as crypto from 'crypto';

interface EdiplomaData {
  id: string;
  studentName: string;
  studentIIN: string;
  degree: string;
  specialty: string;
  graduationDate: string;
  diplomaNumber: string;
  university: string;
  // Приватные данные
  privateData?: {
    gpa?: number;
    courses?: Array<{ name: string; grade: string }>;
    thesis?: string;
    additionalInfo?: Record<string, any>;
  };
}

@Injectable()
export class DiplomasService {
  private readonly logger = new Logger(DiplomasService.name);
  private readonly ediplomaApiUrl = process.env.EDIPLOMA_API_URL || 'https://app.ediploma.kz/api';

  constructor(
    @InjectRepository(Diploma) private readonly repo: Repository<Diploma>,
    private readonly audit: AuditService,
    private readonly orgs: OrgsService,
    private readonly ipfs: IpfsService,
    private readonly firefly: FireFlyService,
    private readonly solana: SolanaService,
  ) {}

  /**
   * Синхронизация диплома из app.ediploma.kz
   */
  async syncFromEdiploma(organizationId: string, ediplomaId: string): Promise<Diploma> {
    this.logger.log(`Syncing diploma ${ediplomaId} for organization ${organizationId}`);

    // 1. Получаем данные из app.ediploma.kz
    const ediplomaData = await this.fetchFromEdiploma(ediplomaId);

    // 2. Проверяем, существует ли уже диплом
    let diploma = await this.repo.findOne({ where: { ediplomaId } });

    const org = await this.orgs.resolve(organizationId);

    if (diploma) {
      // Обновляем существующий
      this.logger.log(`Updating existing diploma ${diploma.id}`);
      diploma.publicData = {
        studentName: ediplomaData.studentName,
        studentIIN: this.maskIIN(ediplomaData.studentIIN), // Частично скрываем ИИН
        degree: ediplomaData.degree,
        specialty: ediplomaData.specialty,
        graduationDate: ediplomaData.graduationDate,
        diplomaNumber: ediplomaData.diplomaNumber,
        university: ediplomaData.university,
      };
      diploma.status = 'updated';
    } else {
      // Создаем новый
      diploma = this.repo.create({
        organization: org,
        ediplomaId,
        publicData: {
          studentName: ediplomaData.studentName,
          studentIIN: this.maskIIN(ediplomaData.studentIIN),
          degree: ediplomaData.degree,
          specialty: ediplomaData.specialty,
          graduationDate: ediplomaData.graduationDate,
          diplomaNumber: ediplomaData.diplomaNumber,
          university: ediplomaData.university,
        },
        status: 'issued',
        issuedAt: new Date(ediplomaData.graduationDate),
      });
    }

    // 3. Сохраняем публичные метаданные в IPFS
    const publicMetadata = {
      ...diploma.publicData,
      ediplomaId,
      issuedAt: diploma.issuedAt?.toISOString(),
    };
    const publicMetadataBuffer = Buffer.from(JSON.stringify(publicMetadata), 'utf8');
    const publicMetadataBase64 = publicMetadataBuffer.toString('base64');
    const publicMetadataResult = await this.ipfs.upload(
      organizationId,
      publicMetadataBuffer,
      `diploma-${ediplomaId}-public.json`,
      'application/json',
    );
    diploma.publicMetadataCid = publicMetadataResult.cid;

    // 4. Сохраняем приватные данные в IPFS (если есть)
    if (ediplomaData.privateData) {
      const privateDataBuffer = Buffer.from(JSON.stringify(ediplomaData.privateData), 'utf8');
      const privateDataBase64 = privateDataBuffer.toString('base64');
      const privateDataResult = await this.ipfs.upload(
        organizationId,
        privateDataBuffer,
        `diploma-${ediplomaId}-private.json`,
        'application/json',
      );
      diploma.privateDataCid = privateDataResult.cid;
      diploma.privateDataHash = crypto.createHash('sha256').update(privateDataBuffer).digest('hex');
    }

    // 5. Создаем приватную транзакцию в Besu через FireFly
    const privateTxData = {
      ediplomaId,
      publicMetadataCid: diploma.publicMetadataCid,
      privateDataCid: diploma.privateDataCid,
      privateDataHash: diploma.privateDataHash,
      timestamp: new Date().toISOString(),
    };
    const txDataHex = '0x' + Buffer.from(JSON.stringify(privateTxData), 'utf8').toString('hex');
    
    try {
      // Создаем приватную транзакцию в Besu через FireFly
      // Privacy group можно настроить позже через FireFly API или получить из PrivacyGroup entity
      const privateTx = await this.firefly.postPrivateTx(
        {
          data: txDataHex,
          // privacyGroupId можно получить из PrivacyGroup entity по organizationId в будущем
        },
        org.fireflyBaseUrl,
      );
      diploma.besuTxHash = privateTx.besu_tx_hash || privateTx.txHash || privateTx.id;
    } catch (error: any) {
      this.logger.warn(`Failed to create private transaction: ${error.message}`);
    }

    // 6. Создаем NFT на Solana (если еще не создан)
    if (!diploma.solanaMint) {
      try {
        const ipfsUri = `ipfs://${diploma.publicMetadataCid}`;
        const mintResult = await this.solana.mint({
          organizationId,
          uri: ipfsUri,
          besuTxHash: diploma.besuTxHash,
          signerPolicy: 'custodial',
        });
        diploma.solanaMint = mintResult.mint;
      } catch (error: any) {
        this.logger.warn(`Failed to mint Solana NFT: ${error.message}`);
      }
    }

    // 7. Сохраняем диплом
    await this.repo.save(diploma);

    // 8. Логируем в аудит
    await this.audit.log({
      organization: { id: org.id } as any,
      eventType: diploma.id ? 'diploma.updated' : 'diploma.issued',
      details: {
        ediplomaId,
        solanaMint: diploma.solanaMint,
        besuTxHash: diploma.besuTxHash,
      },
    });

    return diploma;
  }

  /**
   * Получение диплома по ID
   */
  async getById(diplomaId: string): Promise<Diploma> {
    const diploma = await this.repo.findOne({ where: { id: diplomaId }, relations: ['organization'] });
    if (!diploma) {
      throw new NotFoundException(`Diploma ${diplomaId} not found`);
    }
    return diploma;
  }

  /**
   * Получение диплома по ediplomaId
   */
  async getByEdiplomaId(ediplomaId: string): Promise<Diploma | null> {
    return this.repo.findOne({ where: { ediplomaId }, relations: ['organization'] });
  }

  /**
   * Получение диплома по Solana mint
   */
  async getBySolanaMint(mint: string): Promise<Diploma | null> {
    return this.repo.findOne({ where: { solanaMint: mint }, relations: ['organization'] });
  }

  /**
   * Верификация диплома
   */
  async verify(ediplomaId: string, verificationData?: { studentIIN?: string; studentName?: string }): Promise<{
    valid: boolean;
    diploma?: Diploma;
    message: string;
  }> {
    const diploma = await this.getByEdiplomaId(ediplomaId);
    
    if (!diploma) {
      return { valid: false, message: 'Диплом не найден в блокчейне' };
    }

    if (diploma.status === 'revoked') {
      return { valid: false, diploma, message: 'Диплом отозван' };
    }

    // Проверка данных (если предоставлены)
    if (verificationData) {
      if (verificationData.studentIIN && diploma.publicData?.studentIIN) {
        const fullIIN = this.unmaskIIN(diploma.publicData.studentIIN);
        if (fullIIN !== verificationData.studentIIN) {
          return { valid: false, diploma, message: 'ИИН не совпадает' };
        }
      }
      if (verificationData.studentName && diploma.publicData?.studentName) {
        if (diploma.publicData.studentName.toLowerCase() !== verificationData.studentName.toLowerCase()) {
          return { valid: false, diploma, message: 'Имя не совпадает' };
        }
      }
    }

    return { valid: true, diploma, message: 'Диплом верифицирован' };
  }

  /**
   * Верификация диплома по ИИН (для студентов)
   */
  async verifyByIIN(iin: string): Promise<{
    valid: boolean;
    diploma?: Diploma;
    message: string;
  }> {
    // Валидация ИИН
    if (!/^\d{12}$/.test(iin)) {
      return { valid: false, message: 'Неверный формат ИИН. Должно быть 12 цифр.' };
    }

    // TODO: Реализовать поиск по ИИН в БД
    // Пока используем поиск через публичные данные (маскированный ИИН)
    // В реальности нужно хранить полный ИИН в зашифрованном виде или в приватных данных
    
    // Вариант 1: Поиск через приватные данные (рекомендуется)
    // Нужно будет добавить метод поиска по зашифрованному ИИН
    
    // Вариант 2: Поиск через app.ediploma.kz API
    // Запрос к app.ediploma.kz для получения ediplomaId по ИИН
    try {
      // TODO: Реализовать запрос к app.ediploma.kz API
      // const ediplomaId = await this.fetchEdiplomaIdByIIN(iin);
      // return this.verify(ediplomaId, { studentIIN: iin });
      
      // Mock: для демонстрации возвращаем null, чтобы фронтенд использовал mock данные
      return { valid: false, message: 'Диплом не найден. Endpoint в разработке.' };
    } catch (error: any) {
      this.logger.error(`Error verifying by IIN: ${error.message}`);
      return { valid: false, message: 'Ошибка при поиске диплома' };
    }
  }

  /**
   * Получение приватных данных диплома (только для авторизованных пользователей)
   */
  async getPrivateData(diplomaId: string, organizationId: string): Promise<any> {
    const diploma = await this.getById(diplomaId);
    
    // Проверка прав доступа
    const org = await this.orgs.resolve(organizationId);
    if (diploma.organization.id !== org.id) {
      throw new BadRequestException('Access denied');
    }

    if (!diploma.privateDataCid) {
      return null;
    }

    // Получаем приватные данные из IPFS
    const privateDataBuffer = await this.ipfs.get(diploma.privateDataCid);
    const privateData = JSON.parse(privateDataBuffer.toString('utf8'));

    // Проверяем хеш
    const hash = crypto.createHash('sha256').update(privateDataBuffer).digest('hex');
    if (hash !== diploma.privateDataHash) {
      throw new BadRequestException('Private data integrity check failed');
    }

    return privateData;
  }

  /**
   * Отзыв диплома
   */
  async revoke(organizationId: string, diplomaId: string): Promise<Diploma> {
    const diploma = await this.getById(diplomaId);
    const org = await this.orgs.resolve(organizationId);

    if (diploma.organization.id !== org.id) {
      throw new BadRequestException('Access denied');
    }

    diploma.status = 'revoked';
    diploma.revokedAt = new Date();
    await this.repo.save(diploma);

    // Обновляем NFT статус на Solana
    if (diploma.solanaMint) {
      try {
        await this.solana.revoke({
          organizationId,
          mint: diploma.solanaMint,
          besuTxHash: diploma.besuTxHash,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Failed to revoke Solana NFT: ${errorMessage}`);
      }
    }

    await this.audit.log({
      organization: { id: org.id } as any,
      eventType: 'diploma.revoked',
      details: { diplomaId, ediplomaId: diploma.ediplomaId },
    });

    return diploma;
  }

  /**
   * Список дипломов организации
   */
  async list(organizationId: string, limit = 50, offset = 0): Promise<{ diplomas: Diploma[]; total: number }> {
    const org = await this.orgs.resolve(organizationId);
    const [diplomas, total] = await this.repo.findAndCount({
      where: { organization: { id: org.id } as any },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { diplomas, total };
  }

  /**
   * Получение данных из app.ediploma.kz
   */
  private async fetchFromEdiploma(ediplomaId: string): Promise<EdiplomaData> {
    // TODO: Реализовать реальный запрос к API app.ediploma.kz
    // Пока используем mock данные
    this.logger.debug(`Fetching diploma ${ediplomaId} from ${this.ediplomaApiUrl}`);
    
    // Пример структуры данных из app.ediploma.kz
    return {
      id: ediplomaId,
      studentName: 'Иванов Иван Иванович',
      studentIIN: '123456789012',
      degree: 'Бакалавр',
      specialty: 'Информатика',
      graduationDate: '2024-06-15',
      diplomaNumber: `DIP-${ediplomaId}`,
      university: 'КазНУ имени Аль-Фараби',
      privateData: {
        gpa: 3.8,
        courses: [
          { name: 'Математика', grade: 'A' },
          { name: 'Программирование', grade: 'A+' },
        ],
        thesis: 'Разработка системы блокчейн для дипломов',
      },
    };
  }

  /**
   * Маскировка ИИН (показываем только первые 4 и последние 2 цифры)
   */
  private maskIIN(iin: string): string {
    if (iin.length !== 12) return iin;
    return `${iin.slice(0, 4)}******${iin.slice(-2)}`;
  }

  /**
   * Раскрытие ИИН (для верификации)
   * В реальности нужно хранить полный ИИН в зашифрованном виде в приватных данных
   */
  private unmaskIIN(maskedIIN: string): string {
    // В production нужно получать полный ИИН из приватных данных или использовать шифрование
    // Для демонстрации возвращаем как есть (в реальности maskedIIN содержит только частично скрытый ИИН)
    return maskedIIN.replace(/\*/g, '');
  }
}

