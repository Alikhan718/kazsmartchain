import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { RoleAssignment } from './role-assignment.entity';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true, unique: true, name: 'bin' })
  bin?: string; // БИН организации для связи с сертификатами

  @Column({ nullable: true, name: 'email_domain' })
  emailDomain?: string; // Email домен организации

  @Column({ type: 'jsonb', nullable: true })
  limits?: Record<string, unknown>;

  @Column({ nullable: true })
  fireflyBaseUrl?: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => User, (u) => u.organization)
  users!: User[];

  @OneToMany(() => RoleAssignment, (r) => r.organization)
  roles!: RoleAssignment[];
}

