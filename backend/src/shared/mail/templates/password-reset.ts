import { baseLayout } from './base';

export function passwordResetTemplate(opts: { name?: string; link: string }) {
  const title = 'Reset your password';
  const greeting = opts.name ? `Hi ${opts.name},` : 'Hi,';
  const content = `
    <p>${greeting}</p>
    <p>We received a request to reset your password. Click the button below to set a new password. This link will expire soon.</p>
    <p style="margin-top:16px;">
      <a href="${opts.link}" style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:10px 14px; border-radius:8px;">Reset password</a>
    </p>
    <p style="margin-top:12px; color:#6b7280; font-size:12px;">If you didn’t request this, you can safely ignore this email.</p>
  `;
  return baseLayout({ title, content });
}

export function passwordResetText(opts: { name?: string; link: string }) {
  const name = opts.name ? `Hi ${opts.name}, ` : 'Hi, ';
  return `${name}Reset your password using this link: ${opts.link}. If you didn’t request this, ignore this email.`;
}
