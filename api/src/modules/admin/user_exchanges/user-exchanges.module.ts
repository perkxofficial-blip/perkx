import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserExchange } from '../../../entities';
import { UserExchangesService } from './user-exchanges.service';
import { UserExchangesController } from './user-exchanges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserExchange])],
  controllers: [UserExchangesController],
  providers: [UserExchangesService],
  exports: [UserExchangesService],
})
export class UserExchangesModule {}
