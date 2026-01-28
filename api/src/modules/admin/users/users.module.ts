import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserExchange, Exchange } from '../../../entities';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from '../../../common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserExchange, Exchange]),
    StorageModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class AdminUsersModule {}
