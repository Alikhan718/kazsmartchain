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

  @ManyToOne(() => Organization, (o) => o.users)
  organization!: Organization;

  @OneToMany(() => RoleAssignment, (r) => r.user)
  roles!: RoleAssignment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

