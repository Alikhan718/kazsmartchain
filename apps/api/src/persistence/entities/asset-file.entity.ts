import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity({ name: 'asset_files' })
export class AssetFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Column({ unique: true })
  ipfsCid!: string;

  @Column()
  mime!: string;

  @Column({ nullable: true })
  filename?: string;

  @Column({ default: false })
  pinned!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

