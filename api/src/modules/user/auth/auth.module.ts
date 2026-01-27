import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UserEmailVerification,
  User,
  UserLoginOtp,
  UserPasswordReset,
} from '../../../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, LocalStrategy } from './strategies';
import { EmailVerificationService } from './email-verification.service';
import { MailModule } from '../../../mail/mail.module';
import { TwoFatosService } from './two-fatos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserEmailVerification,
      UserLoginOtp,
      UserPasswordReset,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.userSecret'),
        signOptions: {
          expiresIn: "1d",
        },
      }),
    }),
    ConfigModule,
  ],
  providers: [
    AuthService,
    EmailVerificationService,
    TwoFatosService,
    JwtStrategy,
    LocalStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, EmailVerificationService, TwoFatosService],
})
export class AuthModule {}
