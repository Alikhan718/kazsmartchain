import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'auth_challenges' })
@Index(['nonce'], { unique: true })
@Index(['expiresAt'])
@Index(['used'])
export class AuthChallenge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  nonce!: string;

  @Column({ type: 'text' })
  challenge!: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'used_at' })
  usedAt?: Date;

  @Column({ nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

