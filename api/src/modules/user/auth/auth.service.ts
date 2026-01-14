import {
  Injectable,
  ConflictException,
  InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../entities';
import { RegisterDto } from './dto';
import { randomBytes } from 'crypto';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    @InjectDataSource()
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
    private dataSource: DataSource,
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
            throw new ConflictException('Email already exists');
          }
          const user = userRepo.create({
            ...registerDto,
            is_active: false,
            referral_code: this.generateReferralCode(),
          });
          await userRepo.save(user);
          await this.emailVerificationService.sendWithManager(manager, {
            id: user.id,
            email: user.email,
          });
          return {
            message: 'User registered successfully. Please verify your email.',
          };
        });
      } catch (err) {
        // Unique violation (Postgres)
        if (err instanceof QueryFailedError && (err as any).code === '23505') { // mã 23505 unique_violation của Postgres
          const detail = (err as any).detail || '';
          if (detail.includes('email')) {
            throw new ConflictException('Email already exists');
          }
          if (detail.includes('referral_code')) {
            if (attempt === MAX_RETRY) break;
            continue; // retry
          }
        }
        if (err instanceof ConflictException) throw err;
        throw new InternalServerErrorException('Register failed');
      }
    }
    throw new InternalServerErrorException(
      'Cannot generate unique referral code, please try again later',
    );
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
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async findByUnVerifiedEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email, is_active: false } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async markEmailVerified(userId: number) {
    await this.userRepository.update(userId, {
      is_active: true,
    });
  }
}
