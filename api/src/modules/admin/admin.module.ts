import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/auth.module';
import { AdminUsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AdminExchangesModule } from './exchanges/exchanges.module';
import { UserExchangesModule } from './user_exchanges/user-exchanges.module';

@Module({
  imports: [
    AdminAuthModule,
    AdminUsersModule,
    CampaignsModule,
    AdminExchangesModule,
    UserExchangesModule,
  ],
})
export class AdminModule {}
