import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer'
import { UserLoginOtp } from '../../../entities/user_login_otp.entity';
import { randomInt } from 'node:crypto';

@Injectable()
export class TwoFatosService {
  constructor(
    @InjectRepository(UserLoginOtp)
    @InjectDataSource()
    private otpRepo: Repository<UserLoginOtp>,
    private mailerService: MailerService,
    private dataSource: DataSource,
  ) {}

  async sendEmailOtp(user: { id: number; email: string }) {
    const otp = this.generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(UserLoginOtp, {
        user_id: user.id,
        verified_at: null,
      });
      await manager.save(UserLoginOtp, {
        user_id: user.id,
        otp_code: otp,
        expires_at: expiresAt,
      });
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'PerkX - Login verification code\n',
      template: 'login-otp',
      context: {
        otp,
        expiresIn: 10,
      },
    });

    return { message: 'OTP sent to email' };
  }
  async verifyEmailOtp(userId: number, otp: string) {
    const record = await this.otpRepo.findOne({
      where: {
        user_id: userId,
        verified_at: null,
      },
      order: { created_at: 'DESC' },
    });

    if (!record) throw new BadRequestException('OTP not found');
    if (record.expires_at < new Date()) {
      throw new BadRequestException('OTP expired');
    }
    if (record.attempt_count >= 5) {
      throw new BadRequestException('Too many attempts');
    }
    if (record.otp_code !== otp) {
      await this.otpRepo.update(record.id, {
        attempt_count: record.attempt_count + 1,
      });
      throw new BadRequestException('Invalid OTP');
    }
    await this.otpRepo.update(record.id, {
      verified_at: new Date(),
    });
    return { message: 'OTP verified successfully' };
  }

  private generateOtp(length = 6) {
    return randomInt(0, 10 ** length).toString().padStart(length, '0');
  }
}
