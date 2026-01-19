import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserStatus } from '../../../../entities';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Please verify your email');
    }
    if (user.status === UserStatus.DEACTIVATE) {
      throw new UnauthorizedException(
        'Your account is banned, please contact to admin for support',
      );
    }

    return user;
  }
}
