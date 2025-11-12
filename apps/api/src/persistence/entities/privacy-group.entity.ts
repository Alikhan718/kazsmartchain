import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity({ name: 'privacy_groups' })
export class PrivacyGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Column({ unique: true })
  privacyGroupId!: string;

  @Column({ type: 'jsonb', nullable: true })
  members?: string[];

  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

