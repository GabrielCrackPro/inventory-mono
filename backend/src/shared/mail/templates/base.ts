export function baseLayout(opts: {
  title: string;
  content: string;
  footerText?: string;
}) {
  const footer = opts.footerText ?? 'You received this email from Inventory.';
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f6f7f9; padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <thead>
        <tr>
          <td style="padding:20px 24px; background:#111827; color:#fff; font-weight:600; font-size:16px;">
            ${opts.title}
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:24px; color:#111827; font-size:14px; line-height:1.6;">
            ${opts.content}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="padding:16px 24px; color:#6b7280; font-size:12px; background:#f9fafb;">
            ${footer}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
  `;
}
