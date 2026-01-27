import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('exchange_products')
export class ExchangeProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 100 })
  exchange_name: string;

  @Column({ type: 'text' })
  exchange_signup_link: string;

  @Column({ length: 200 })
  product_name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  default_fee_maker: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  default_fee_taker: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  final_fee_maker: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  final_fee_taker: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ave_rebate: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
