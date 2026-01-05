import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

export type DiplomaStatus = 'issued' | 'revoked' | 'updated';

@Entity({ name: 'diplomas' })
export class Diploma {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  // Идентификатор диплома из app.ediploma.kz
  @Column({ unique: true })
  @Index()
  ediplomaId!: string;

  // Solana NFT mint адрес
  @Column({ nullable: true, unique: true })
  @Index()
  solanaMint?: string;

  // IPFS CID для публичных метаданных
  @Column({ nullable: true })
  publicMetadataCid?: string;

  // IPFS CID для приватных данных (зашифрованные)
  @Column({ nullable: true })
  privateDataCid?: string;

  // Хеш приватной транзакции в Besu
  @Column({ nullable: true })
  @Index()
  besuTxHash?: string;

  // Статус диплома
  @Column({ type: 'varchar', default: 'issued' })
  status!: DiplomaStatus;

  // Публичные данные (JSON) - хранятся в БД для быстрого доступа
  @Column({ type: 'jsonb', nullable: true })
  publicData?: {
    studentName?: string;
    studentIIN?: string; // ИИН студента (может быть частично скрыт)
    degree?: string; // Степень
    specialty?: string; // Специальность
    graduationDate?: string;
    diplomaNumber?: string;
    university?: string;
  };

  // Хеш приватных данных для верификации
  @Column({ nullable: true })
  privateDataHash?: string;

  // Дата выпуска диплома
  @Column({ type: 'timestamp', nullable: true })
  issuedAt?: Date;

  // Дата отзыва (если отозван)
  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

