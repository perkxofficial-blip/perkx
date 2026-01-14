import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserEmailVerification, User } from '../../../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, LocalStrategy } from './strategies';
import { EmailVerificationService } from './email-verification.service';
import { MailModule } from '../../mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserEmailVerification]),
    PassportModule,
    JwtModule.register({
      secret: process.env.USER_JWT_SECRET,
      signOptions: { expiresIn: '1d' }, // Token expiration time
    }),
    ConfigModule,
    MailModule
  ],
  providers: [
    AuthService,
    EmailVerificationService,
    JwtStrategy,
    LocalStrategy
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    EmailVerificationService
  ],
})
export class AuthModule {}
