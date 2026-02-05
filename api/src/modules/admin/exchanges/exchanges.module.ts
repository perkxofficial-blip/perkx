import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange, ExchangeProduct, UserExchange, User } from '../../../entities';
import { AdminExchangesService } from './exchanges.service';
import { AdminExchangesController } from './exchanges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange, ExchangeProduct, UserExchange, User])],
  controllers: [AdminExchangesController],
  providers: [AdminExchangesService],
  exports: [AdminExchangesService],
})
export class AdminExchangesModule {}
