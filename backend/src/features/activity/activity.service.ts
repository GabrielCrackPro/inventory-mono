import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ActivityType } from '@inventory/shared';
import { PrismaService } from '../../prisma';
import { CreateActivityDto, GetActivitiesDto } from './activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new activity record
   * @param userId The ID of the user performing the action
   * @param dto The activity data
   * @returns The created activity
   */
  create(userId: number, dto: CreateActivityDto) {
    const data: Prisma.ActivityCreateInput = {
      name: dto.name,
      description: dto.description || null,
      type: dto.type as any, // Cast shared enum to Prisma enum
      metadata: dto.metadata || undefined,
      ipAddress: dto.ipAddress || null,
      userAgent: dto.userAgent || null,
      user: { connect: { id: userId } },
    };

    return this.prisma.activity.create({
      data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  /**
   * Log an activity for a user
   * @param userId The user ID
   * @param type The activity type
   * @param name The activity name
   * @param description Optional description
   * @param metadata Optional metadata
   * @param ipAddress Optional IP address
   * @param userAgent Optional user agent
   */
  logActivity(
    userId: number,
    type: ActivityType,
    name: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.create(userId, {
      name,
      description,
      type,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get activities for a user with optional filtering
   * @param userId The user ID
   * @param filters Optional filters
   * @returns Array of activities
   */
  findAllForUser(userId: number, filters?: GetActivitiesDto) {
    const houseIdNum =
      filters?.houseId != null ? Number(filters.houseId) : null;

    const where: Prisma.ActivityWhereInput = {
      userId,
      ...(filters?.type && { type: filters.type as any }),
      ...(filters?.startDate &&
        filters?.endDate && {
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        }),
      ...(houseIdNum != null &&
        Number.isFinite(houseIdNum) && {
          OR: [
            {
              metadata: {
                path: ['houseId'],
                equals: houseIdNum as any,
              } as any,
            },
            {
              metadata: {
                path: ['houseId'],
                equals: String(houseIdNum) as any,
              } as any,
            },
          ],
        }),
    };

    return this.prisma.activity.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  }

  /**
   * Get all activities (admin only)
   * @param filters Optional filters
   * @returns Array of activities
   */
  findAll(filters?: GetActivitiesDto) {
    const where: Prisma.ActivityWhereInput = {
      ...(filters?.type && { type: filters.type as any }), // Cast shared enum to Prisma enum
      ...(filters?.startDate &&
        filters?.endDate && {
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        }),
    };

    return this.prisma.activity.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  }

  /**
   * Get activity by ID
   * @param id The activity ID
   * @returns The activity or null
   */
  findById(id: number) {
    return this.prisma.activity.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  /**
   * Get activity statistics for a user
   * @param userId The user ID
   * @returns Activity statistics
   */
  async getStatistics(userId: number) {
    const totalActivities = await this.prisma.activity.count({
      where: { userId },
    });

    const activitiesByType = await this.prisma.activity.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
    });

    const recentActivities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return {
      totalActivities,
      activitiesByType: activitiesByType.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      recentActivities,
    };
  }
}
