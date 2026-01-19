import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserExchange, Exchange } from '../../../entities';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailService } from '../../../mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserExchange, Exchange])],
  providers: [UsersService, MailService],
  controllers: [UsersController],
})
export class AdminUsersModule {}
