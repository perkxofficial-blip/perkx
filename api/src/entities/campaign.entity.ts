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
import { Exchange } from './exchange.entity';

export enum CampaignCategory {
  NEW_USER = 'New User',
  TRADING_COMPETITION = 'Trading Competition',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Index()
  exchange_id: number;

  @ManyToOne(() => Exchange, { nullable: true, createForeignKeyConstraints: false, })
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  @Index()
  slug: string;

  @Column({ length: 255 })
  sub_title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  banner_path: string;

  @Column({ type: 'text', nullable: true })
  redirect_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  preview_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  preview_end: Date;

  @Column({ type: 'timestamp' })
  launch_start: Date;

  @Column({ type: 'timestamp' })
  launch_end: Date;

  @Column({ type: 'timestamp', nullable: true })
  archive_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  archive_end: Date;

  @Column({ default: false })
  featured: boolean;

  @Column({
    type: 'enum',
    enum: CampaignCategory,
    nullable: true,
  })
  category: CampaignCategory;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
