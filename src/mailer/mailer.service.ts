import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EnvService } from '../shared/services/env.service';
import * as handlebars from 'handlebars';
import { IEmailData } from './interfaces/email-data.interface';
import path from 'node:path';
import * as fs from 'node:fs/promises';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly envService: EnvService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.envService.smtpUser,
        pass: this.envService.smtpPassword,
      },
    });
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    const templateDir = path.join(process.cwd(), 'src', 'mailer', 'templates');

    const layoutSource = await fs.readFile(
      path.join(templateDir, 'base.hbs'),
      'utf8',
    );
    const layoutTemplate = handlebars.compile(layoutSource);

    const templateSource = await fs.readFile(
      path.join(templateDir, `${templateName}.hbs`),
      'utf8',
    );
    const childTemplate = handlebars.compile(templateSource);

    const content = childTemplate(context);

    return layoutTemplate({ ...context, content });
  }

  public async sendEmail(
    to: string,
    emailData: IEmailData,
    context: Record<string, unknown>,
  ): Promise<void> {
    try {
      const html = await this.renderTemplate(emailData.template, context);

      await this.transporter.sendMail({
        from: this.envService.smtpUser, // або envService.mailFrom
        to,
        subject: emailData.subject,
        html,
      });
    } catch (err) {
      console.error('MAIL ERROR:', err);
      throw new InternalServerErrorException('Cannot send email');
    }
  }
}
