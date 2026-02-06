import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exchange } from './exchange.entity';

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Exchange)
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;

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
