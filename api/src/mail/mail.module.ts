import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as path from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => (
        {
          transport: {
            host: configService.get('MAIL_HOST'),
            port: configService.get<number>('MAIL_PORT'),
            auth: {
              user: configService.get('MAIL_USERNAME'),
              pass: configService.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: configService.get('MAIL_FROM'),
          },
          template: {
            dir: path.join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          options: {
            partials: {
              dir: path.join(__dirname, 'templates'),
            },
          }
        }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
