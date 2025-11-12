import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export type Role = 'SuperAdmin' | 'OrgAdmin' | 'Operator' | 'Auditor';

@Entity({ name: 'role_assignments' })
export class RoleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization, (o) => o.roles)
  organization!: Organization;

  @ManyToOne(() => User, (u) => u.roles)
  user!: User;

  @Column({ type: 'varchar' })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

