import { Module } from '@nestjs/common';
import { PublicPagesController } from './pages.controller';
import { PagesModule as AdminPagesModule } from '../../admin/pages/pages.module';

@Module({
  imports: [AdminPagesModule],
  controllers: [PublicPagesController],
})
export class PublicPagesModule {}
