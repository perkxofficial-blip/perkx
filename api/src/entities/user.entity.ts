import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // 🔹 nullable
  @Column({ nullable: true })
  first_name: string;

  // 🔹 nullable
  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  is_active: boolean;

  // 🔹 required + unique
  @Column({ unique: true })
  referral_code: string;

  // 🔹 nullable + index
  @Index()
  @Column({ nullable: true })
  referral_user_id: number;

  // 🔹 nullable datetime
  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
