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

export enum UserStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  DEACTIVATE = 'DEACTIVATE',
}

export enum UserGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

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

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'enum', enum: UserGender, nullable: true })
  gender: UserGender;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  status: UserStatus;

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
