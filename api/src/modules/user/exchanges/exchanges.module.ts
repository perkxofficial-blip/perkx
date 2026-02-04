import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserExchange, Exchange } from '../../../entities';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { ExchangesModule as CommonExchangesModule } from '../../../common/exchanges';
import { StorageModule } from '../../../common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserExchange, Exchange]),
    CommonExchangesModule,
    StorageModule,
  ],
  providers: [ExchangesService],
  controllers: [ExchangesController],
  exports: [ExchangesService],
})
export class ExchangesModule {}
