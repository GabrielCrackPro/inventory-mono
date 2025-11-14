import { Injectable, ForbiddenException } from '@nestjs/common';
import { ActivityType } from '@inventory/shared';
import { PrismaService } from '../../prisma';
import { ensureOwner, findOrThrow } from '../../shared';
import { ActivityService } from '../activity/activity.service';
import { CreateRoomDto, ShareRoomDto, UpdateRoomDto } from './room.dto';

@Injectable()
export class RoomService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async create(dto: CreateRoomDto, userId: number) {
    // Validate house access if houseId is provided
    if (dto.houseId) {
      await this.validateHouseAccess(dto.houseId, userId);
    }

    const room = await this.prisma.room.create({
      data: {
        ...dto,
        ownerId: userId, // Ensure the current user is the owner
      },
    });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.ROOM_CREATED,
      `Created room: ${room.name}`,
      `Created room "${room.name}" ${room.type ? `of type ${room.type}` : ''}`,
      { roomId: room.id, houseId: room.houseId },
    );

    return room;
  }

  async findAll() {
    return this.prisma.room.findMany({
      include: { items: true },
    });
  }

  async findAllForUser(userId: number) {
    return this.prisma.room.findMany({
      where: {
        OR: [{ ownerId: userId }, { sharedWith: { some: { userId } } }],
      },
      include: { items: true },
    });
  }

  async findOne(id: number, userId: number) {
    const room = await findOrThrow(
      this.prisma.room.findUnique({
        where: { id },
        include: { items: true, house: true },
      }),
      'Room not found',
    );

    // Validate user has access to this room
    await this.validateRoomAccess(room, userId);

    return room;
  }

  async findAllForUserInHouse(userId: number, houseId: number) {
    // Validate house access (owner or member via house access)
    await this.validateHouseAccess(houseId, userId);

    // Once house access is validated, return all rooms in the house (membership grants read access)
    return this.prisma.room.findMany({
      where: { houseId },
      include: { items: true },
    });
  }

  async update(id: number, userId: number, dto: UpdateRoomDto) {
    const room = await findOrThrow(
      this.prisma.room.findUnique({
        where: { id },
        include: { house: true },
      }),
      'Room not found',
    );

    // Validate room access and ownership
    await this.validateRoomAccess(room, userId);
    ensureOwner(room, userId);

    // If updating houseId, validate access to the new house
    if (dto.houseId && dto.houseId !== room.houseId) {
      await this.validateHouseAccess(dto.houseId, userId);
    }

    const updatedRoom = await this.prisma.room.update({
      where: { id },
      data: dto,
    });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.ROOM_UPDATED,
      `Updated room: ${updatedRoom.name}`,
      `Updated room "${updatedRoom.name}"`,
      { roomId: id, houseId: updatedRoom.houseId },
    );

    return updatedRoom;
  }

  async remove(id: number, userId: number) {
    const room = await findOrThrow(
      this.prisma.room.findUnique({
        where: { id },
        include: { house: true },
      }),
      'Room not found',
    );

    // Validate room access and ownership
    await this.validateRoomAccess(room, userId);
    ensureOwner(room, userId);

    const deletedRoom = await this.prisma.room.delete({ where: { id } });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.ROOM_DELETED,
      `Deleted room: ${room.name}`,
      `Deleted room "${room.name}"`,
      { roomId: id, houseId: room.houseId },
    );

    return deletedRoom;
  }

  async share(roomId: number, dto: ShareRoomDto, userId: number) {
    const room = await findOrThrow(
      this.prisma.room.findUnique({
        where: { id: roomId },
        include: { house: true },
      }),
      'Room not found',
    );

    // Validate room access and ownership
    await this.validateRoomAccess(room, userId);
    ensureOwner(room, userId);

    const sharedAccess = await this.prisma.roomAccess.upsert({
      where: { roomId_userId: { roomId, userId: dto.userId } },
      update: { permission: dto.permission },
      create: { roomId, userId: dto.userId, permission: dto.permission },
    });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.ROOM_SHARED,
      `Shared room: ${room.name}`,
      `Shared room "${room.name}" with user ${dto.userId} with ${dto.permission} permission`,
      { roomId, sharedWithUserId: dto.userId, permission: dto.permission },
    );

    return sharedAccess;
  }

  async revokeAccess(roomId: number, targetUserId: number, userId: number) {
    const room = await findOrThrow(
      this.prisma.room.findUnique({
        where: { id: roomId },
        include: { house: true },
      }),
      'Room not found',
    );

    // Validate room access and ownership
    await this.validateRoomAccess(room, userId);
    ensureOwner(room, userId);

    return this.prisma.roomAccess.deleteMany({
      where: { roomId, userId: targetUserId },
    });
  }

  private async validateHouseAccess(houseId: number, userId: number) {
    // First ensure the house exists
    const house = await findOrThrow(
      this.prisma.house.findUnique({
        where: { id: houseId },
        select: { id: true, ownerId: true },
      }),
      'House not found or access denied',
    );

    if (house.ownerId === userId) return house;

    // Check explicit house access membership
    const membership = await this.prisma.houseAccess.findUnique({
      where: { houseId_userId: { houseId, userId } },
      select: { permission: true },
    });

    if (!membership) {
      throw new ForbiddenException('House not found or access denied');
    }
    return house;
  }

  private async validateRoomAccess(room: any, userId: number) {
    // If room belongs to a house, validate house access
    if (room.houseId) {
      await this.validateHouseAccess(room.houseId, userId);
    }

    // Also validate direct room access
    const isOwner = room.ownerId === userId;
    const hasSharedAccess = await this.prisma.roomAccess.findFirst({
      where: { roomId: room.id, userId },
    });

    if (!isOwner && !hasSharedAccess) {
      throw new ForbiddenException('Room access denied');
    }
  }
}
