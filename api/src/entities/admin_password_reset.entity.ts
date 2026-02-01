import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin_password_resets')
export class AdminPasswordReset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  admin_id: number;

  @Index({ unique: true })
  @Column({ length: 255 })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}