import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { ContractInterface } from './contract-interface.entity';

@Entity({ name: 'contract_listeners' })
export class ContractListener {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @ManyToOne(() => ContractInterface)
  contract!: ContractInterface;

  @Column()
  eventName!: string;

  @Column({ nullable: true })
  streamId?: string; // FireFly stream

  @Column({ type: 'jsonb', nullable: true })
  filter?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

