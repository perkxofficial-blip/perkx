import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import exchangeConfiguration from './config/exchange-configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule as UserAuthModule } from './modules/user/auth/auth.module';
import { ProfileModule } from './modules/user/profile/profile.module';
import { ExchangesModule } from './modules/user/exchanges/exchanges.module';
import { AdminModule } from './modules/admin/admin.module';
import { PublicModule } from './modules/public/public.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [configuration, exchangeConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        // ssl: process.env.NODE_ENV === 'production' ? true : false, // Enable SSL for secure connection to AWS RDS
        // extra: {
        //   ssl: {
        //     rejectUnauthorized: process.env.NODE_ENV === 'production' ? false : true,
        //   },
        // },
      }),
      inject: [ConfigService],
    }),
    UserAuthModule,
    ProfileModule,
    ExchangesModule,
    AdminModule,
    PublicModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
