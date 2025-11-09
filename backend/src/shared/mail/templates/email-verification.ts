import { baseLayout } from './base';

export function emailVerificationTemplate(opts: {
  name?: string;
  code: string;
  expiresMinutes?: number;
}) {
  const title = 'Verify your email';
  const subtitle = opts.name ? `Hi ${opts.name},` : 'Hi,';
  const expiresText = `This code will expire in ${opts.expiresMinutes ?? 10} minutes.`;

  const content = `
    <p style="margin:0 0 16px;">${subtitle}</p>
    <p style="margin:0 0 16px;">Use the following One-Time Code to verify your email:</p>
    <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;display:inline-block;">${opts.code}</div>
    <p style="margin:16px 0 0;color:#6b7280;">${expiresText}</p>
  `;
  return baseLayout({ title, content });
}

export function emailVerificationText(opts: {
  name?: string;
  code: string;
  expiresMinutes?: number;
}) {
  const lines = [
    'Verify your email',
    opts.name ? `Hi ${opts.name},` : 'Hi,',
    'Use this One-Time Code to verify your email:',
    opts.code,
    `This code will expire in ${opts.expiresMinutes ?? 10} minutes.`,
  ];
  return lines.join('\n');
}
