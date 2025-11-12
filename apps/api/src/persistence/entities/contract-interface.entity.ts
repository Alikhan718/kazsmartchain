import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity({ name: 'contract_interfaces' })
export class ContractInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  abi!: string; // JSON string

  @Column({ nullable: true })
  address?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

