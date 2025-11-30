import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'certificates' })
@Index(['serialNumber'], { unique: true })
@Index(['revoked'])
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  serialNumber!: string;

  @Column({ type: 'jsonb' })
  subject!: Record<string, any>;

  @Column({ type: 'jsonb' })
  issuer!: Record<string, any>;

  @Column({ type: 'text' })
  certificateData!: string; // Base64 encoded

  @Column({ type: 'timestamp' })
  validFrom!: Date;

  @Column({ type: 'timestamp' })
  validTo!: Date;

  @Column({ default: false })
  revoked!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  revokedReason?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

