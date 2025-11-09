import { baseLayout } from './base';

export function itemShareTemplate(opts: {
  inviter: string;
  item: string;
  link: string;
}) {
  const title = 'An item was shared with you';
  const content = `
    <p>${opts.inviter} shared the item <strong>${opts.item}</strong> with you.</p>
    <p style="margin-top:8px;">Click the button below to view it.</p>
    <p style="margin-top:16px;">
      <a href="${opts.link}" style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:10px 14px; border-radius:8px;">View item</a>
    </p>
  `;
  return baseLayout({ title, content });
}

export function roomShareTemplate(opts: {
  inviter: string;
  room: string;
  link: string;
}) {
  const title = 'A room was shared with you';
  const content = `
    <p>${opts.inviter} shared the room <strong>${opts.room}</strong> with you.</p>
    <p style="margin-top:8px;">Click the button below to open the room.</p>
    <p style="margin-top:16px;">
      <a href="${opts.link}" style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:10px 14px; border-radius:8px;">Open room</a>
    </p>
  `;
  return baseLayout({ title, content });
}

export function houseShareTemplate(opts: {
  inviter: string;
  house: string;
  link: string;
}) {
  const title = 'A house was shared with you';
  const content = `
    <p>${opts.inviter} shared the house <strong>${opts.house}</strong> with you.</p>
    <p style="margin-top:8px;">Click the button below to open the house.</p>
    <p style="margin-top:16px;">
      <a href="${opts.link}" style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:10px 14px; border-radius:8px;">Open house</a>
    </p>
  `;
  return baseLayout({ title, content });
}

export function itemShareText(opts: {
  inviter: string;
  item: string;
  link: string;
}) {
  return `${opts.inviter} shared an item (${opts.item}) with you. Open: ${opts.link}`;
}

export function roomShareText(opts: {
  inviter: string;
  room: string;
  link: string;
}) {
  return `${opts.inviter} shared a room (${opts.room}) with you. Open: ${opts.link}`;
}

export function houseShareText(opts: {
  inviter: string;
  house: string;
  link: string;
}) {
  return `${opts.inviter} shared a house (${opts.house}) with you. Open: ${opts.link}`;
}
