import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from '../../../entities';
import { ExchangeProduct } from '../../../entities';
import { AdminExchangesService } from './exchanges.service';
import { AdminExchangesController } from './exchanges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange, ExchangeProduct])],
  controllers: [AdminExchangesController],
  providers: [AdminExchangesService],
  exports: [AdminExchangesService],
})
export class AdminExchangesModule {}
