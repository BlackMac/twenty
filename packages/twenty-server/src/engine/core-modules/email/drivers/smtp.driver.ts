import { Logger } from '@nestjs/common';

import {
  createTransport,
  type SendMailOptions,
  type Transporter,
} from 'nodemailer';

import { type EmailDriverInterface } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

export class SmtpDriver implements EmailDriverInterface {
  private readonly logger = new Logger(SmtpDriver.name);
  private transport: Transporter;

  constructor(options: SMTPConnection.Options) {
    this.transport = createTransport(options);
  }

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    const envFromAddress = process.env.EMAIL_FROM_ADDRESS;
    const envFromName = process.env.EMAIL_FROM_NAME;

    // clone original options
    const finalOptions: SendMailOptions = { ...sendMailOptions };

    // if EMAIL_FROM_ADDRESS is set, override from with a nice "Name <email>" header
    if (envFromAddress) {
      const displayName = envFromName || envFromAddress;
      finalOptions.from = `"${displayName}" <${envFromAddress}>`;
    }

    this.transport
      .sendMail(finalOptions)
      .then(() =>
        this.logger.log(`Email to '${finalOptions.to}' successfully sent`),
      )
      .catch((err) =>
        this.logger.error(`sending email to '${finalOptions.to}': ${err}`),
      );
  }
}
