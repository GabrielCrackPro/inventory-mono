import { baseLayout } from './base';

export function welcomeTemplate(opts: { name: string }) {
  const title = 'Welcome to Inventory';
  const content = `
    <p>Hi ${opts.name},</p>
    <p>Your account is ready. Start organizing your items!</p>
    <p style="margin-top:16px;">
      <a href="#" style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:10px 14px; border-radius:8px;">Open Inventory</a>
    </p>
  `;
  return baseLayout({ title, content });
}

export function welcomeText(opts: { name: string }) {
  return `Hi ${opts.name}, Your account is ready. Start organizing your items!`;
}
