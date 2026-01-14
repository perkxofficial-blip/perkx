import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../entities';
import { RegisterDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const payload = (user) => ({ sub: user.id, email: user.email });
    const MAX_RETRY = 5; // Số lần thử tạo mã giới thiệu unique, đảm bảo hơn generate code trước
    for (let i = 0; i < MAX_RETRY; i++) {
      try {
        const user = this.userRepository.create({
          ...registerDto,
          referral_code: this.generateReferralCode(),
        });
        await this.userRepository.save(user);
        const accessToken = await this.jwtService.signAsync(payload(user));
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
      } catch (e) {
        if (e?.code === '23505') {
          if (e?.detail?.includes('email')) {
            throw new ConflictException('Email already exists');
          }
          if (e?.detail?.includes('referral_code')) {
            continue;
          }
        }
        throw new InternalServerErrorException();
      }
    }
    throw new InternalServerErrorException(
      'Cannot generate unique referral code, please try again',
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
}
