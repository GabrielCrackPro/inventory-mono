import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActivityType, RoomType, UserRole } from '@inventory/shared';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma';
import { UnauthorizedException } from '../../shared';
import { Role, UserService } from '../user';
import { ActivityService } from '../activity/activity.service';

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
