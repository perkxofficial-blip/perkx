import { Module } from '@nestjs/common';
import { PublicPagesModule } from './pages/pages.module';
import { PublicCampaignsModule } from './campaigns/campaigns.module';
import { PublicExchangesModule } from './exchanges/exchanges.module';

@Module({
  imports: [PublicPagesModule, PublicCampaignsModule, PublicExchangesModule],
})
export class PublicModule {}
