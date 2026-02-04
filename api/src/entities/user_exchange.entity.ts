import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_exchanges')
@Index(['user_id', 'exchange_id'], { unique: true })
@Index(['exchange_id', 'exchange_uid'], { unique: true })
@Index(['exchange_uid'])
export class UserExchange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  exchange_id: number;

  @Column({ length: 100 })
  exchange_uid: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'PENDING', 'REJECTED'],
    default: 'PENDING',
  })
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';

  @Column({ nullable: true })
  updated_by: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
