import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/auth.module';
import { AdminUsersModule } from './users/users.module';
import { PagesModule } from './pages/pages.module';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [AdminAuthModule, AdminUsersModule, PagesModule, CampaignsModule],
})
export class AdminModule { }
