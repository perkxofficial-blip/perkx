import {
  BadRequestException,
  ConflictException, HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { User, UserPasswordReset, UserStatus } from '../../../entities';
import { RegisterDto } from './dto';
import * as crypto from 'crypto';
import { randomBytes } from 'crypto';
import { EmailVerificationService } from './email-verification.service';
import { MailerService } from '@nestjs-modules/mailer';
import { TwoFatosService } from './two-fatos.service';
import { throwValidateError } from '../../../common/errors';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailVerificationService: EmailVerificationService,
    @InjectDataSource()
    private dataSource: DataSource,
    private mailerService: MailerService,
    private twoFatosService: TwoFatosService,
  ) {}

  async register(registerDto: RegisterDto) {
    const MAX_RETRY = 5;
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        return await this.dataSource.transaction(async (manager) => {
          const userRepo = manager.getRepository(User);
          const existing = await userRepo.findOne({
            where: { email: registerDto.email },
            select: ['id'],
          });

          if (existing) {
            throwValidateError(
              'email',
              'validate.email_already_exists',
              HttpStatus.CONFLICT,
            );
          }

          let userInvite: Pick<User, 'id'> | null = null;
          if (registerDto.referral_user_id) {
            userInvite = await userRepo.findOne({
              where: { referral_code: registerDto.referral_user_id },
              select: ['id'],
            });
            if (!userInvite) {
              throwValidateError('referral_user_id', 'validate.invalid_referral_uid');
            }
          }

          const user = userRepo.create({
            ...registerDto,
            status: UserStatus.INACTIVE,
            referral_code: this.generateReferralCode(),
            referral_user_id: userInvite?.id || null,
          });
          await userRepo.save(user);
          const token = await this.emailVerificationService.sendWithManager(manager, {
            id: user.id,
            email: user.email,
          });
          
          return {
            success: true,
            token: token
          };
        });
      } catch (err) {
        // Unique violation (Postgres)
        if (err instanceof QueryFailedError && (err as any).code === '23505') {
          // mã 23505 unique_violation của Postgres
          const detail = (err as any).detail || '';
          if (detail.includes('email')) {
            throwValidateError(
              'email',
              'validate.email_already_exists',
              HttpStatus.CONFLICT,
            );
          }
          if (detail.includes('referral_user_id')) {
            if (attempt === MAX_RETRY) break;
            continue; // retry
          }
        }
       throw err
      }
    }
  }

  private generateReferralCode(): string {
    const year = new Date().getFullYear();
    const random = randomBytes(4).toString('hex').slice(0, 6);
    return `${year}-${random}`;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (user.status === UserStatus.INACTIVE) {
      const token = await this.emailVerificationService.getOldToken(user.id)
      return {
        verified: false,
        email: user.email,
        token: token
      };
    }
    await this.twoFatosService.getEmailOtp(user);
    return {
      verified: true,
      email: user.email,
    };
  }

  async findByUnVerifiedEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.INACTIVE },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async forgotPassword(email: string) {
    return await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const passwordResetRepo = manager.getRepository(UserPasswordReset);

      const user = await userRepo.findOne({ where: { email } });
      if (!user) return;
      await passwordResetRepo.delete({ user_id: user.id });
      const { raw, hashed } = this.generateToken();

      await passwordResetRepo.save({
        user_id: user.id,
        hashed,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      });
      const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${raw}`;
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'PerkX - Reset your password',
        template: 'reset-password',
        context: {
          resetPasswordUrl,
        },
      });
    });
  }

  private generateToken() {
    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hashed };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    return await this.dataSource.transaction(async (manager) => {
      const passwordResetRepo = manager.getRepository(UserPasswordReset);
      const userRepo = manager.getRepository(User);
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
      const record = await passwordResetRepo.findOne({
        where: { token: hashedToken, used_at: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!record) {
        throw new BadRequestException('Invalid token');
      }
      if (record.expires_at < new Date()) {
        throw new BadRequestException('Token expired');
      }
      const user = await userRepo.findOneBy({ id: record.user_id });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      user.password = newPassword;
      await userRepo.save(user);
      await passwordResetRepo.delete({ user_id: user.id });

      return { message: 'Password reset successfully' };
    });
  }
}
