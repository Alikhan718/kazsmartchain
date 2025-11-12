import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

export type SolanaAssetStatus = 'issued' | 'updated' | 'revoked';

@Entity({ name: 'solana_assets' })
export class SolanaAsset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Column({ unique: true })
  mint!: string;

  @Column()
  uri!: string; // IPFS URI

  @Column({ nullable: true })
  besuTxHash?: string;

  @Column({ type: 'varchar' })
  status!: SolanaAssetStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

