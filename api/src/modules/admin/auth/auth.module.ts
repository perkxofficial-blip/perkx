import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin, AdminPasswordReset } from '../../../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminJwtStrategy, AdminLocalStrategy } from './strategies';
import { MailModule } from '../../../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, AdminPasswordReset]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.adminSecret'),
        signOptions: {
          expiresIn: "1d",
        },
      }),
    }),
    ConfigModule,
    MailModule,
  ],
  providers: [AuthService, AdminJwtStrategy, AdminLocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AdminAuthModule {}
