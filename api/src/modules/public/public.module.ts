import { Module } from '@nestjs/common';
import { PublicPagesModule } from './pages/pages.module';

@Module({
  imports: [PublicPagesModule],
})
export class PublicModule {}
