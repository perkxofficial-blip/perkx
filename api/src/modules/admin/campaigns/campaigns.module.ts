import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign, Exchange } from '../../../entities';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { StorageModule } from '../../../common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Exchange]),
    StorageModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
