import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign, Exchange } from '../../../entities';
import { PublicCampaignsService } from './campaigns.service';
import { PublicCampaignsController } from './campaigns.controller';
import { StorageModule } from '../../../common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Exchange]),
    StorageModule,
  ],
  controllers: [PublicCampaignsController],
  providers: [PublicCampaignsService],
})
export class PublicCampaignsModule {}
