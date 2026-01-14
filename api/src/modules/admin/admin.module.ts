import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/auth.module';
import { AdminUsersModule } from './users/users.module';
import { PagesModule } from './pages/pages.module';

@Module({
  imports: [AdminAuthModule, AdminUsersModule, PagesModule],
})
export class AdminModule { }
