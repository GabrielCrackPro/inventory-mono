import { ActivityType, RoomType } from '@inventory/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma';
import { UnauthorizedException, MailService } from '../../shared';
import { ActivityService } from '../activity/activity.service';
import { Role, UserService } from '../user';

export type AuthUser = {
  id: number;
  email: string;
  role?: string;
  name?: string;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  jti: string;
  user: AuthUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
    private readonly mail: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as AuthUser;
  }

  // Email verification (OTP)
  private otpExpiryMinutes() {
    const v = Number(process.env.OTP_EXP_MINUTES ?? 10);
    return Number.isFinite(v) && v > 0 ? v : 10;
  }

  private otpMaxAttempts() {
    const v = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
    return Number.isFinite(v) && v > 0 ? v : 5;
  }

  private generateOtp(): string {
    const n = Math.floor(Math.random() * 1000000);
    return n.toString().padStart(6, '0');
  }

  async sendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { ok: true };

    const code = this.generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(
      Date.now() + this.otpExpiryMinutes() * 60 * 1000,
    );

    // @ts-ignore
    await this.prisma.emailVerificationCode.create({
      data: { userId: user.id, codeHash, expiresAt },
    });

    await this.mail
      .sendEmailVerificationEmail(user.email, {
        name: user.name,
        code,
        expiresMinutes: this.otpExpiryMinutes(),
      })
      .catch(() => undefined);

    return { ok: true };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid email or code');

    if (user['emailVerified']) return { ok: true };

    // @ts-ignore
    const codes = await this.prisma.emailVerificationCode.findMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const c of codes) {
      if (await bcrypt.compare(code, c.codeHash)) {
        // mark used and set user verified
        // @ts-ignore
        await this.prisma.emailVerificationCode.update({
          where: { id: c.id },
          data: { usedAt: new Date() },
        });
        await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
        // Send welcome email after verifying email
        this.mail
          .sendWelcomeEmail(user.email, { name: user.name })
          .catch(() => undefined);
        return { ok: true };
      }
    }

    // Increment attempts on the latest code (if any) and enforce limit
    const latest = codes[0];
    if (latest) {
      const attempts = (latest.attempts ?? 0) + 1;
      // @ts-ignore
      await this.prisma.emailVerificationCode.update({
        where: { id: latest.id },
        data: { attempts },
      });
      if (attempts >= this.otpMaxAttempts()) {
        // Mark as used to invalidate further attempts on this code
        // @ts-ignore
        await this.prisma.emailVerificationCode.update({
          where: { id: latest.id },
          data: { usedAt: new Date() },
        });
      }
    }

    throw new BadRequestException('Invalid or expired code');
  }

  async resendVerification(email: string) {
    // Optionally, invalidate existing active codes
    const user = await this.usersService.findByEmail(email);
    if (!user) return { ok: true };
    // @ts-ignore
    await this.prisma.emailVerificationCode.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return this.sendVerificationCode(email);
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always respond success to avoid user enumeration
    if (!user) return { ok: true };

    // Invalidate existing active tokens and purge expired ones for this user
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, expiresAt: { lt: new Date() } },
      });
    } catch (e) {
      void e;
    }

    const raw = randomUUID();
    const tokenHash = await bcrypt.hash(raw, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Persist token
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const publicBase =
      process.env.RESET_LINK_BASE ||
      'http://localhost:4200/auth/reset-password?token=';
    const tokenToSend = `${user.id}.${raw}`;
    const link = `${publicBase}${encodeURIComponent(tokenToSend)}`;

    await this.mail
      .sendPasswordResetEmail(user.email, { name: user.name, link })
      .catch(() => undefined);

    return { ok: true };
  }

  private async verifyAndConsumePasswordResetToken(token: string) {
    const [userIdStr, raw] = token.split('.');
    const userId = Number(userIdStr);
    if (!userId || !raw) throw new BadRequestException('Invalid token');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    for (const t of tokens) {
      if (await bcrypt.compare(raw, t.tokenHash)) {
        // mark used
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.prisma.passwordResetToken.update({
          where: { id: t.id },
          data: { usedAt: new Date() },
        });
        return userId;
      }
    }
    throw new BadRequestException('Invalid or expired token');
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.verifyAndConsumePasswordResetToken(token);
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    // After resetting the password, remove any other active tokens for this user
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId, usedAt: null },
      });
    } catch (e) {
      void e;
    }
    return { ok: true };
  }

  async register(name: string, email: string, password: string) {
    const user = await this.usersService.create({
      email,
      password,
      name,
      role: Role.MEMBER,
    });

    // Create a default house for the new user
    const defaultHouse = await this.prisma.house.create({
      data: {
        name: `${name}'s House`,
        ownerId: user.id,
      },
    });

    // Log activity for house creation
    await this.activityService.logActivity(
      user.id,
      ActivityType.HOUSE_CREATED,
      `Created default house: ${name}'s House`,
      `Created default house "${name}'s House" during user registration`,
      { isDefaultHouse: true },
    );

    // Create a default room in the house
    const defaultRoom = await this.prisma.room.create({
      data: {
        name: 'General Room',
        type: RoomType.PUBLIC,
        ownerId: user.id,
        houseId: defaultHouse.id,
        isShared: false,
      },
    });

    // Log activity for room creation
    await this.activityService.logActivity(
      user.id,
      ActivityType.ROOM_CREATED,
      `Created default room: ${defaultRoom.name}`,
      `Created default room "${defaultRoom.name}" during user registration`,
      { roomId: defaultRoom.id, houseId: defaultHouse.id, isDefaultRoom: true },
    );

    // Send email verification OTP
    await this.sendVerificationCode(email);

    return user;
  }

  private async persistRefreshToken(
    userId: number,
    refreshToken: string,
    expiresAt?: Date,
  ) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- generated after `prisma generate`
    return this.prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    });
  }

  private async findRefreshTokenByUserAndHash(
    userId: number,
    refreshToken: string,
  ) {
    // Use Prisma delegate to fetch tokens and compare hashes
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });
    for (const t of tokens) {
      if (await bcrypt.compare(refreshToken, t.tokenHash)) return t;
    }
    return null;
  }

  async login(user: AuthUser, ipAddress?: string, userAgent?: string) {
    const payload: any = { sub: user.id, email: user.email };
    if (user.role) {
      payload.role = user.role;
    } else {
      payload.role = Role.MEMBER;
    }

    const jti = randomUUID();
    // Sign using JwtModule default options (expiresIn from config)
    const token = this.jwtService.sign(payload, { jwtid: jti });
    // We cannot read expiresIn directly from JwtService, approximate 1 day by default
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1);

    // create a refresh token (random UUID) and persist hashed
    const refreshToken = randomUUID();
    const refreshExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    // Persist refresh token and await to ensure it's stored before returning
    await this.persistRefreshToken(user.id, refreshToken, refreshExpiry).catch(
      () => {
        // ignore persistence failure (logging could be added)
        return undefined;
      },
    );

    // Fetch related ids (items, houses and rooms) to include in the response
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        emailVerified: true,
        preferences: true,
        items: {
          select: {
            id: true,
            quantity: true,
            category: { select: { id: true } },
          },
        },
        ownedHouses: { select: { id: true } },
        sharedHouses: { select: { houseId: true } },
        ownedRooms: { select: { id: true } },
        sharedRooms: { select: { roomId: true } },
      },
    });

    const items = fullUser?.items ?? [];
    const itemIds = items.map((i) => i.id);
    const ownedHouseIds = (fullUser?.ownedHouses ?? []).map((h) => h.id);
    const sharedHouseIds = (fullUser?.sharedHouses ?? []).map((h) => {
      return h.houseId;
    });
    const houseIds = Array.from(new Set([...ownedHouseIds, ...sharedHouseIds]));

    const ownedRoomIds = (fullUser?.ownedRooms ?? []).map((r) => r.id);
    const sharedRoomIds = (fullUser?.sharedRooms ?? []).map((r) => {
      return r.roomId;
    });
    const roomIds = Array.from(new Set([...ownedRoomIds, ...sharedRoomIds]));

    // Calculate stats
    const uniqueCategoryIds = new Set(
      items.map((item) => item.category?.id).filter(Boolean),
    );
    const lowStockItems = items.filter((item) => item.quantity <= 2);

    const stats = {
      items: items.length,
      rooms: roomIds.length,
      categories: uniqueCategoryIds.size,
      lowStockItems: lowStockItems.length,
    };

    const enrichedUser = {
      id: fullUser?.id ?? user.id,
      email: fullUser?.email ?? user.email,
      role: fullUser?.role ?? user.role,
      name: fullUser?.name ?? user.name,
      emailVerified: fullUser?.emailVerified,
      preferences: fullUser?.preferences,
      itemIds,
      houseIds,
      roomIds,
      stats,
    } as unknown as AuthUser & {
      itemIds: number[];
      houseIds: number[];
      roomIds: number[];
      stats: {
        items: number;
        rooms: number;
        categories: number;
        lowStockItems: number;
      };
    };

    // Log login activity
    await this.activityService.logActivity(
      user.id,
      ActivityType.USER_LOGIN,
      'User logged in',
      `User ${user.email} logged in successfully`,
      { loginMethod: 'email_password' },
      ipAddress,
      userAgent,
    );

    return {
      access_token: token,
      refresh_token: refreshToken,
      expires_at: tokenExpiry,
      refresh_expires_at: refreshExpiry,
      jti,
      user: enrichedUser,
    } as RefreshResponse;
  }

  async refresh(userId: number, refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token required');

    const tokenRecord = await this.findRefreshTokenByUserAndHash(
      userId,
      refreshToken,
    );
    if (!tokenRecord) throw new UnauthorizedException('Invalid refresh token');

    // Check expiry
    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      // token expired, remove it and reject
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.prisma.refreshToken.delete({
          where: {
            id: tokenRecord.id,
          },
        });
      } catch (err) {
        // ignore deletion errors
        void err;
      }
      throw new UnauthorizedException('Refresh token expired');
    }

    // rotate: create new refresh token and delete old
    const newRefresh = randomUUID();
    const refreshExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.persistRefreshToken(userId, newRefresh, refreshExpiry);

    // delete old token by id (Prisma delegate)
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.prisma.refreshToken.delete({
        where: {
          id: tokenRecord.id,
        },
      });
    } catch (err) {
      // ignore deletion errors in refresh rotation; could log to observability
      void err;
    }

    // issue new access token
    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        emailVerified: true,
        preferences: true,
        ownedHouses: { select: { id: true } },
        sharedHouses: { select: { houseId: true } },
      },
    });

    const payload: any = {
      sub: userId,
      email: userRecord?.email,
      role: userRecord?.role ?? Role.MEMBER,
    };
    const jti = randomUUID();
    const access = this.jwtService.sign(payload, { jwtid: jti });

    const ownedHouseIds = (userRecord?.ownedHouses ?? []).map((h) => h.id);
    const sharedHouseIds = (userRecord?.sharedHouses ?? []).map((h) => {
      return h.houseId;
    });
    const houseIds = Array.from(new Set([...ownedHouseIds, ...sharedHouseIds]));

    return {
      access_token: access,
      refresh_token: newRefresh,
      jti,
      user: {
        id: userRecord?.id ?? userId,
        email: userRecord?.email,
        role: userRecord?.role,
        name: userRecord?.name,
        emailVerified: userRecord?.emailVerified,
        preferences: userRecord?.preferences,
        houseIds,
      } as unknown as AuthUser & {
        itemIds: number[];
        houseIds: number[];
        roomIds: number[];
      },
    } as RefreshResponse;
  }

  async logout(
    jti: string,
    userId?: number,
    expiresAt?: Date,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = await this.prisma.revokedToken.create({
        data: {
          jti,
          expiresAt,
        },
      });

      // Log logout activity if userId is provided
      if (userId) {
        await this.activityService.logActivity(
          userId,
          ActivityType.USER_LOGOUT,
          'User logged out',
          'User logged out successfully',
          { jti },
          ipAddress,
          userAgent,
        );
      }

      return result;
    } catch (err: any) {
      // Prisma unique constraint error code
      if (err?.code === 'P2002') {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const found = await this.prisma.revokedToken.findUnique({
            where: {
              jti,
            },
          });
          return found ?? null;
        } catch (e) {
          void e;
          return null;
        }
      }
      // rethrow non-unique errors
      throw err;
    }
  }
}
