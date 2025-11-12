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

