import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMailRegister(to: string, verifyUrl: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: '[PerkX] Welcome to PerkX - Please verify your email address\n',
        template: 'verify-email',
        context: {
          verifyUrl,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send status email to ${to}`, error.stack);
    }
  }

  async sendMailActive(to: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: '[PerkX] Your Account is Now Active!',
        template: 'active-email',
        context: {
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send status email to ${to}`, error.stack);
    }
  }

  async sendMailResetPassword(to: string, resetPasswordUrl: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: '[PerkX] Reset your password',
        template: 'reset-password',
        context: {
          resetPasswordUrl,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send status email to ${to}`, error.stack);
    }
  }

  async sendMailVerifyOtp(to: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: '[PerkX] Your verification code to log in',
        template: 'login-otp',
        context: {
          otp,
          expiresIn: 10,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send status email to ${to}`, error.stack);
    }
  }
}
