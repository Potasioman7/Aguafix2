import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { envs } from '../config/envs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envs.mailHost,
      port: envs.mailPort,
      secure: envs.mailSecure, // true para 465, false para otros puertos (STARTTLS)
      auth: {
        user: envs.mailUser,
        pass: envs.mailPassword,
      },
    });
  }

  /**
   * Envia un correo con el HTML ya generado (template) al destinatario indicado.
   */
  async sendEmail(to: string, subject: string, template: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: envs.mailFrom,
        to,
        subject,
        html: template,
      });
      this.logger.log(`Correo enviado a ${to} - asunto: "${subject}"`);
    } catch (error) {
      this.logger.error(`Error enviando correo a ${to}: ${error.message}`);
      throw error;
    }
  }
}
