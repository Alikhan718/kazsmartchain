import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity({ name: 'x509certs' })
export class X509Cert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Column({ type: 'text' })
  pem!: string;

  @Column({ type: 'varchar' })
  fingerprint!: string;

  @Column({ type: 'timestamptz', nullable: true })
  notBefore?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  notAfter?: Date;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

