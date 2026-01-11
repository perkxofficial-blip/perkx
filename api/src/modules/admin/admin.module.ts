import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/auth.module';
import { AdminUsersModule } from './users/users.module';

@Module({
  imports: [AdminAuthModule, AdminUsersModule],
})
export class AdminModule {}
