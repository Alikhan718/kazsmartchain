import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { RoleAssignment } from './role-assignment.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  externalId?: string; // OIDC/SAML subject

  @Column({ nullable: true })
  walletAddress?: string; // Solana wallet

  @Column({ nullable: true, unique: true, name: 'certificate_serial' })
  certificateSerial?: string; // Serial number сертификата ЭЦП

  @Column({ type: 'jsonb', nullable: true, name: 'certificate_subject' })
  certificateSubject?: Record<string, any>; // Subject из сертификата

  @Column({ type: 'jsonb', nullable: true, name: 'certificate_issuer' })
  certificateIssuer?: Record<string, any>; // Issuer из сертификата

  @Column({ type: 'timestamp', nullable: true, name: 'certificate_valid_from' })
  certificateValidFrom?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'certificate_valid_to' })
  certificateValidTo?: Date;

  // Biometric KYC fields
  @Column({ nullable: true, unique: true, name: 'iin' })
  iin?: string; // ИИН (Индивидуальный Идентификационный Номер)

  @Column({ nullable: true, name: 'phone' })
  phone?: string; // Телефон из EDocument верификации

  @Column({ default: false, name: 'biometric_verified' })
  biometricVerified!: boolean; // Прошел ли биометрическую верификацию

  @Column({ nullable: true, name: 'biometric_session_id' })
  biometricSessionId?: string; // Последний session_id для аудита

  @ManyToOne(() => Organization, (o) => o.users)
  organization!: Organization;

  @OneToMany(() => RoleAssignment, (r) => r.user)
  roles!: RoleAssignment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

