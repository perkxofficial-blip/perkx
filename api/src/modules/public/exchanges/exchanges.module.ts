import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from '../../../entities';
import { PublicExchangesService } from './exchanges.service';
import { PublicExchangesController } from './exchanges.controller';
import { StorageModule } from '../../../common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exchange]),
    StorageModule,
  ],
  controllers: [PublicExchangesController],
  providers: [PublicExchangesService],
})
export class PublicExchangesModule {}
