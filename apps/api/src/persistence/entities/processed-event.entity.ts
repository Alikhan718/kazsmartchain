import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'processed_events' })
export class ProcessedEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  eventKey!: string; // composed idempotency key

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}

