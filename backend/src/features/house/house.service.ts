import { Injectable } from '@nestjs/common';
import { ActivityType } from '@inventory/shared';
import { PrismaService } from 'src/prisma';
import { ensureOwner, findOrThrow } from '../../shared';
import { ActivityService } from '../activity/activity.service';
import { CreateHouseDto, ShareHouseDto, UpdateHouseDto } from './house.dto';

@Injectable()
export class HouseService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async create(dto: CreateHouseDto) {
    const house = await this.prisma.house.create({ data: dto });

    // Log activity
    await this.activityService.logActivity(
      dto.ownerId,
      ActivityType.HOUSE_CREATED,
      `Created house: ${house.name}`,
      `Created house "${house.name}" ${house.address ? `at ${house.address}` : ''}`,
      { houseId: house.id },
    );

    return house;
  }

  findAllForUser(userId: number) {
    return this.prisma.house.findMany({
      where: {
        OR: [{ ownerId: userId }, { sharedWith: { some: { userId } } }],
      },
      include: { rooms: true, items: true },
    });
  }

  async findOne(id: number) {
    return findOrThrow(
      this.prisma.house.findUnique({
        where: { id },
        include: { rooms: true, items: true },
      }),
      'House not found',
    );
  }

  async update(id: number, userId: number, dto: UpdateHouseDto) {
    const house = await findOrThrow(
      this.prisma.house.findUnique({ where: { id } }),
      'House not found',
    );
    ensureOwner(house, userId);

    const updatedHouse = await this.prisma.house.update({
      where: { id },
      data: dto,
    });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.HOUSE_UPDATED,
      `Updated house: ${updatedHouse.name}`,
      `Updated house "${updatedHouse.name}"`,
      { houseId: id },
    );

    return updatedHouse;
  }

  async remove(id: number, userId: number) {
    const house = await findOrThrow(
      this.prisma.house.findUnique({ where: { id } }),
      'House not found',
    );
    ensureOwner(house, userId);

    const deletedHouse = await this.prisma.house.delete({ where: { id } });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.HOUSE_DELETED,
      `Deleted house: ${house.name}`,
      `Deleted house "${house.name}"`,
      { houseId: id },
    );

    return deletedHouse;
  }

  async share(houseId: number, dto: ShareHouseDto, userId: number) {
    const house = await findOrThrow(
      this.prisma.house.findUnique({ where: { id: houseId } }),
      'House not found',
    );
    ensureOwner(house, userId);

    const sharedAccess = await this.prisma.houseAccess.upsert({
      where: { houseId_userId: { houseId, userId: dto.userId } },
      update: { permission: dto.permission },
      create: { houseId, userId: dto.userId, permission: dto.permission },
    });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.HOUSE_SHARED,
      `Shared house: ${house.name}`,
      `Shared house "${house.name}" with user ${dto.userId} with ${dto.permission} permission`,
      { houseId, sharedWithUserId: dto.userId, permission: dto.permission },
    );

    return sharedAccess;
  }

  async revokeAccess(houseId: number, targetUserId: number, userId: number) {
    const house = await findOrThrow(
      this.prisma.house.findUnique({ where: { id: houseId } }),
      'House not found',
    );
    ensureOwner(house, userId);

    return this.prisma.houseAccess.deleteMany({
      where: { houseId, userId: targetUserId },
    });
  }

  async listAccess(houseId: number) {
    const accesses = await this.prisma.houseAccess.findMany({
      where: { houseId },
      select: {
        userId: true,
        permission: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return accesses.map((a) => ({
      userId: a.userId,
      permission: a.permission,
      user: a.user,
    }));
  }
}
