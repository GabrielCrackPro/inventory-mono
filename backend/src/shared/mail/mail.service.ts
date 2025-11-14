import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { welcomeTemplate, welcomeText } from './templates/welcome';
import {
  itemShareTemplate,
  roomShareTemplate,
  houseShareTemplate,
  itemShareText,
  roomShareText,
  houseShareText,
} from './templates/share';
import {
  passwordResetTemplate,
  passwordResetText,
} from './templates/password-reset';
import {
  emailVerificationTemplate,
  emailVerificationText,
} from './templates/email-verification';
import { inviteTemplate, inviteText } from './templates/invite';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly enabled = process.env.MAIL_ENABLED !== 'false';
  private readonly from = process.env.MAIL_FROM || 'noreply@example.com';
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly toOverride = process.env.MAIL_TO_OVERRIDE;
  private readonly allowlist = (process.env.MAIL_ALLOWLIST || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  async sendEmail(opts: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
  }) {
    if (!this.enabled) {
      this.logger.log(
        `MAIL_DISABLED: subject="${opts.subject}" to="${Array.isArray(opts.to) ? opts.to.join(',') : opts.to}"`,
      );
      return { id: 'mail-disabled' } as any;
    }

    let recipients = Array.isArray(opts.to) ? opts.to : [opts.to];

    if (this.toOverride) {
      recipients = [this.toOverride];
      this.logger.log(
        `MAIL_TO_OVERRIDE set. Routing email to ${this.toOverride}`,
      );
    } else if (this.allowlist.length) {
      const filtered = recipients.filter((r) => this.allowlist.includes(r));
      if (filtered.length === 0) {
        this.logger.warn(
          `No recipients matched MAIL_ALLOWLIST. Skipping send. Original: ${recipients.join(', ')}`,
        );
        return { id: 'mail-skipped-not-allowlisted' } as any;
      }
      recipients = filtered;
    }

    const payload = {
      from: this.from,
      to: recipients,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    } as any;

    const { data, error } = await this.resend.emails.send(payload);

    if (error) {
      this.logger.error(`Resend error: ${error.message}`);
      throw new Error(error.message);
    }

    return data;
  }

  async sendWelcomeEmail(to: string, opts: { name: string }) {
    const subject = 'Welcome to Inventory';
    const html = welcomeTemplate({ name: opts.name });
    const text = welcomeText({ name: opts.name });
    return this.sendEmail({ to, subject, html, text });
  }

  async sendHouseInviteEmail(
    to: string | string[],
    opts: { inviter: string; house: string; link: string; permission: string },
  ) {
    const subject = `You're invited to a house (${opts.permission})`;
    const html = inviteTemplate({
      inviter: opts.inviter,
      house: opts.house,
      permission: opts.permission,
      link: opts.link,
    });
    const text = inviteText({
      inviter: opts.inviter,
      house: opts.house,
      permission: opts.permission,
      link: opts.link,
    });
    return this.sendEmail({ to, subject, html, text });
  }

  async sendItemShareEmail(
    to: string | string[],
    opts: { inviter: string; item: string; link: string },
  ) {
    const subject = 'An item was shared with you';
    const html = itemShareTemplate({
      inviter: opts.inviter,
      item: opts.item,
      link: opts.link,
    });
    const text = itemShareText({
      inviter: opts.inviter,
      item: opts.item,
      link: opts.link,
    });
    return this.sendEmail({ to, subject, html, text });
  }

  async sendRoomShareEmail(
    to: string | string[],
    opts: { inviter: string; room: string; link: string },
  ) {
    const subject = 'A room was shared with you';
    const html = roomShareTemplate({
      inviter: opts.inviter,
      room: opts.room,
      link: opts.link,
    });
    const text = roomShareText({
      inviter: opts.inviter,
      room: opts.room,
      link: opts.link,
    });
    return this.sendEmail({ to, subject, html, text });
  }

  async sendHouseShareEmail(
    to: string | string[],
    opts: { inviter: string; house: string; link: string },
  ) {
    const subject = 'A house was shared with you';
    const html = houseShareTemplate({
      inviter: opts.inviter,
      house: opts.house,
      link: opts.link,
    });
    const text = houseShareText({
      inviter: opts.inviter,
      house: opts.house,
      link: opts.link,
    });
    return this.sendEmail({ to, subject, html, text });
  }

  async sendPasswordResetEmail(
    to: string,
    opts: { name?: string; link: string },
  ) {
    const subject = 'Reset your password';
    const html = passwordResetTemplate({ name: opts.name, link: opts.link });
    const text = passwordResetText({ name: opts.name, link: opts.link });
    return this.sendEmail({ to, subject, html, text });
  }

  async sendEmailVerificationEmail(
    to: string,
    opts: { name?: string; code: string; expiresMinutes?: number },
  ) {
    const subject = 'Verify your email';
    const html = emailVerificationTemplate({
      name: opts.name,
      code: opts.code,
      expiresMinutes: opts.expiresMinutes,
    });
    const text = emailVerificationText({
      name: opts.name,
      code: opts.code,
      expiresMinutes: opts.expiresMinutes,
    });
    return this.sendEmail({ to, subject, html, text });
  }
}
