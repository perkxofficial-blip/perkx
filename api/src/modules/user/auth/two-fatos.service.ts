import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { randomInt } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { User, UserLoginOtp, UserStatus, AccessLog } from '../../../entities';
import { MailService } from '../../../mail/mail.service';

@Injectable()
export class TwoFatosService {
  constructor(
    @InjectRepository(UserLoginOtp)
    private otpRepo: Repository<UserLoginOtp>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AccessLog)
    private accessLogRepo: Repository<AccessLog>,
    private jwtService: JwtService,
    private mailerService: MailService,
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

      await this.mailerService.sendMailVerifyOtp(user.email, otp)

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async resendOtp(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE }
    });
    return await this.getEmailOtp(user)
  }
  async verifyEmailOtp(email: string, otp: string, ipAddress: string, userAgent: string) {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
    });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    const record = await this.otpRepo.findOne({
      where: {
        user_id: user.id,
        verified_at: IsNull(),
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
    
    // Insert access log after successful login
    await this.accessLogRepo.save({
      user_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return this.getAccessToken(user);
  }

  private generateOtp(length = 6) {
    return randomInt(0, 10 ** length)
      .toString()
      .padStart(length, '0');
  }

  public async getAccessToken(user: User) {
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
