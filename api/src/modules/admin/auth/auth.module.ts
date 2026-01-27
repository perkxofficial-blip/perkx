import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from '../../../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminJwtStrategy, AdminLocalStrategy } from './strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
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
  ],
  providers: [AuthService, AdminJwtStrategy, AdminLocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AdminAuthModule {}
