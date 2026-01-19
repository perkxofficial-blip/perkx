import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMailChangeStatusUser(to: string, status: string) {
    const isActive = status === 'ACTIVE';

    try {
      await this.mailerService.sendMail({
        to,
        subject: isActive
          ? 'Your PerkX account has been activated'
          : 'Your PerkX account has been deactivated',
        template: 'change-status-user',
        context: {
          email: to,
          isActive,
          title: isActive ? 'Account Activated' : 'Account Deactivated',
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send status email to ${to}`, error.stack);
    }
  }
}
