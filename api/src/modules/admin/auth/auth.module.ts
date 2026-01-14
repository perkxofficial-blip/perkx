import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Admin } from '../../../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminJwtStrategy, AdminLocalStrategy } from './strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    PassportModule,
    JwtModule.register({
      secret: process.env.ADMIN_JWT_SECRET,
      signOptions: { expiresIn: '1d' }, // Token expiration time
    }),
    ConfigModule,
  ],
  providers: [AuthService, AdminJwtStrategy, AdminLocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AdminAuthModule {}
