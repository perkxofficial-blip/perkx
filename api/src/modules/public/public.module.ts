import { Module } from '@nestjs/common';
import { PublicPagesModule } from './pages/pages.module';
import { PublicCampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [PublicPagesModule, PublicCampaignsModule],
})
export class PublicModule {}
