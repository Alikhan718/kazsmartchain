import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity({ name: 'audit_events' })
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization, { nullable: true })
  organization?: Organization;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @Column()
  eventType!: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, unknown>;

  @Column({ nullable: true })
  signer?: string; // custodial | wallet:<address>

  @CreateDateColumn()
  createdAt!: Date;
}

