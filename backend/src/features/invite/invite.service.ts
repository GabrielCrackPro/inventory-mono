import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { MailService } from '../../shared/mail';
import crypto from 'crypto';

const INVITE_TTL_DAYS = Number(process.env.INVITE_TTL_DAYS || 7);
const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:4200';

function sha256(s: string) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async createHouseInvite(params: {
    houseId: number;
    inviterId: number;
    email: string;
    permission: 'VIEW' | 'EDIT' | 'ADMIN';
  }) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(token);
    const expiresAt = new Date(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    const house = await this.prisma.house.findUnique({
      where: { id: params.houseId },
    });
    if (!house) throw new Error('House not found');
    if (house.ownerId !== params.inviterId) {
      throw new Error('Only the house owner can invite members');
    }

    await this.prisma.houseInvite.create({
      data: {
        houseId: params.houseId,
        email: params.email,
        inviterId: params.inviterId,
        permission: params.permission as any,
        tokenHash,
        expiresAt,
      },
    });

    const link = `${FRONTEND_BASE_URL}/accept-invite?token=${token}`;

    const inviter = await this.prisma.user.findUnique({
      where: { id: params.inviterId },
    });
    const inviterName = inviter?.name || inviter?.email || 'A user';

    await this.mail.sendHouseInviteEmail(params.email, {
      inviter: inviterName,
      house: house.name,
      permission: params.permission,
      link,
    });

    return { ok: true };
  }

  async cancelHouseInvite(params: {
    houseId: number;
    requesterId: number;
    email: string;
  }) {
    const house = await this.prisma.house.findUnique({ where: { id: params.houseId } });
    if (!house) throw new Error('House not found');
    if (house.ownerId !== params.requesterId) {
      throw new Error('Only the house owner can cancel invites');
    }

    const res = await this.prisma.houseInvite.deleteMany({
      where: {
        houseId: params.houseId,
        email: params.email.toLowerCase(),
        usedAt: null,
      },
    });

    return { ok: true, deleted: res.count };
  }

  async getInviteByToken(token: string) {
    const tokenHash = sha256(token);
    const invite = await this.prisma.houseInvite.findUnique({
      where: { tokenHash },
      include: { house: { select: { id: true, name: true } } },
    });
    if (!invite) return null;
    const expired = invite.expiresAt.getTime() < Date.now();
    return {
      email: invite.email,
      permission: invite.permission,
      expiresAt: invite.expiresAt,
      usedAt: invite.usedAt,
      house: invite.house,
      expired,
    };
  }

  async acceptInvite(token: string, userId: number) {
    const tokenHash = sha256(token);
    const invite = await this.prisma.houseInvite.findUnique({
      where: { tokenHash },
    });
    if (!invite) throw new Error('Invite not found');
    if (invite.usedAt) throw new Error('Invite already used');
    if (invite.expiresAt.getTime() < Date.now())
      throw new Error('Invite expired');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error('Invite email does not match your account email');
    }

    await this.prisma.houseAccess.upsert({
      where: { houseId_userId: { houseId: invite.houseId, userId } },
      update: { permission: invite.permission },
      create: {
        houseId: invite.houseId,
        userId,
        permission: invite.permission,
      },
    });

    await this.prisma.houseInvite.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    return { ok: true, houseId: invite.houseId };
  }
}
