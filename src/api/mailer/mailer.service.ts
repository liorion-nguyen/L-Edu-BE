import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly mailerService: NestMailerService) {}

  async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    context?: any;
  }): Promise<void> {
    this.logger.debug(`Attempting to send email to ${options.to}`);
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
      this.logger.debug(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }
}