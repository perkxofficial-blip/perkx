import { Module } from '@nestjs/common';
import { PublicCampaignsModule } from './campaigns/campaigns.module';
import { PublicExchangesModule } from './exchanges/exchanges.module';

@Module({
  imports: [PublicCampaignsModule, PublicExchangesModule],
})
export class PublicModule {}
