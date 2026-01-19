import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { User, UserLoginOtp, UserStatus } from '../../../entities';

@Injectable()
export class TwoFatosService {
  constructor(
    @InjectRepository(UserLoginOtp)
    private otpRepo: Repository<UserLoginOtp>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getEmailOtp(user: { id: number; email: string }) {
    try {
      const otp = this.generateOtp(6);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

      await this.dataSource.transaction(async (manager) => {
        await manager.delete(UserLoginOtp, {
          user_id: user.id,
        });
        await manager.save(UserLoginOtp, {
          user_id: user.id,
          otp_code: otp,
          expires_at: expiresAt,
        });
      });

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'PerkX - Login verification code',
        template: 'login-otp',
        context: {
          otp,
          expiresIn: 10,
        },
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async verifyEmailOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
    });
    const record = await this.otpRepo.findOne({
      where: {
        user_id: user.id,
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

    return this.getAccessToken(user);
  }

  private generateOtp(length = 6) {
    return randomInt(0, 10 ** length)
      .toString()
      .padStart(length, '0');
  }

  private async getAccessToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        referral_code: user.referral_code,
      },
    };
  }
}
