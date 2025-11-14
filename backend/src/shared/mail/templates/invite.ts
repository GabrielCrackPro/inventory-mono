export function inviteTemplate(opts: {
  inviter: string;
  house: string;
  permission: string;
  link: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; line-height:1.6;">
    <h2>You are invited to a house</h2>
    <p><strong>${opts.inviter}</strong> invited you to join the house <strong>${opts.house}</strong> with <strong>${opts.permission}</strong> permissions.</p>
    <p>Click the button below to accept the invite:</p>
    <p>
      <a href="${opts.link}" style="display:inline-block;padding:10px 16px;background:#1f2937;color:#fff;text-decoration:none;border-radius:6px">Accept Invite</a>
    </p>
    <p>Or open this link: <a href="${opts.link}">${opts.link}</a></p>
    <p>If you did not expect this email, you can ignore it.</p>
  </div>
  `;
}

export function inviteText(opts: {
  inviter: string;
  house: string;
  permission: string;
  link: string;
}) {
  return `You are invited to a house\n\n${opts.inviter} invited you to join the house ${opts.house} with ${opts.permission} permissions.\n\nAccept: ${opts.link}`;
}
