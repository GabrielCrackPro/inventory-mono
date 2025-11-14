import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { PermissionLevel } from '@prisma/client';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getHousePermission(
    userId: number,
    houseId: number,
  ): Promise<PermissionLevel | null> {
    const house = await this.prisma.house.findUnique({
      select: { ownerId: true },
      where: { id: houseId },
    });
    if (!house) return null;
    if (house.ownerId === userId) return PermissionLevel.ADMIN;

    const access = await this.prisma.houseAccess.findUnique({
      where: { houseId_userId: { houseId, userId } },
      select: { permission: true },
    });
    return access?.permission ?? null;
  }

  async getRoomPermission(
    userId: number,
    roomId: number,
  ): Promise<PermissionLevel | null> {
    const room = await this.prisma.room.findUnique({
      select: { ownerId: true, houseId: true },
      where: { id: roomId },
    });
    if (!room) return null;
    if (room.ownerId === userId) return PermissionLevel.ADMIN;

    const direct = await this.prisma.roomAccess.findUnique({
      where: { roomId_userId: { roomId, userId } },
      select: { permission: true },
    });
    if (direct?.permission) return direct.permission;

    // Inherit from house if available
    if (room.houseId) {
      return this.getHousePermission(userId, room.houseId);
    }
    return null;
  }

  async getItemPermission(
    userId: number,
    itemId: number,
  ): Promise<PermissionLevel | null> {
    const item = await this.prisma.item.findUnique({
      select: { userId: true, roomId: true, houseId: true },
      where: { id: itemId },
    });
    if (!item) return null;
    if (item.userId === userId) return PermissionLevel.ADMIN;

    // Prefer room inheritance first
    if (item.roomId) {
      const roomLevel = await this.getRoomPermission(userId, item.roomId);
      if (roomLevel) return roomLevel;
    }
    if (item.houseId) {
      const houseLevel = await this.getHousePermission(userId, item.houseId);
      if (houseLevel) return houseLevel;
    }
    return null;
  }
}
