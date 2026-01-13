import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_login_otps')
export class UserLoginOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  user_id: number;

  @Column({ length: 10 })
  otp_code: string;

  @Column({ default: 0 })
  attempt_count: number;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
