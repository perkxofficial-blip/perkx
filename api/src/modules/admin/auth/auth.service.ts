import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Admin } from '../../../entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateAdmin(username: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && (await admin.validatePassword(password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(admin: any) {
    const payload = { 
      sub: admin.id, 
      username: admin.username,
      role: admin.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
