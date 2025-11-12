import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'relay_checkpoints' })
export class RelayCheckpoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  streamId!: string;

  @Column()
  lastEventId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

