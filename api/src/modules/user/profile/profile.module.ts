import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserExchange, Exchange } from '../../../entities';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { StorageModule } from '../../../common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserExchange, Exchange]),
    StorageModule,
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
