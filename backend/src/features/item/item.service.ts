import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ActivityType, ItemVisibility } from '@inventory/shared';
import { PrismaService } from '../../prisma';
import { ForbiddenException } from '../../shared';
import { ActivityService } from '../activity/activity.service';
import { CreateItemDto, UpdateItemDto } from './item.dto';

@Injectable()
export class ItemService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  private hasHouseId(x: unknown): x is { houseId?: number } {
    return (
      typeof x === 'object' &&
      x !== null &&
      Object.prototype.hasOwnProperty.call(x, 'houseId')
    );
  }

  /**
   * Create a new item in the database.
   * @param userId The ID of the user who is creating the item.
   * @param dto The data to create the item with.
   * @returns The newly created item.
   * @throws ForbiddenException If the user is not allowed to create items in the room.
   */
  async create(userId: number, dto: CreateItemDto) {
    // Find room strictly by numeric ID
    const room = await this.findRoomById(dto.room, userId);
    if (!room) {
      throw new ForbiddenException('Room not found or access denied.');
    }

    const canEditInRoom = await this.prisma.userCanEditInRoom(room.id, userId);
    if (!canEditInRoom) {
      throw new ForbiddenException('Not allowed to add items in this room.');
    }

    // Find or create category if provided
    let categoryId: number | undefined;
    if (dto.category) {
      const category = await this.findOrCreateCategory(dto.category);
      categoryId = category.id;
    }

    const houseId = room.houseId;
    const data: Prisma.ItemCreateInput = {
      name: dto.name,
      description: dto.description || null,
      brand: dto.brand || null,
      model: dto.model || null,
      serialNumber: dto.serialNumber || null,
      condition: dto.condition || null,
      location: dto.location || null,
      quantity: dto.quantity,
      unit: dto.unit || 'pieces',
      minStock: dto.minStock || 1,
      tags: dto.tags || [],
      isShared: dto.isShared || false,
      sharedWith: dto.sharedWith || [],
      visibility: dto.visibility || ItemVisibility.PRIVATE,
      purchaseDate: dto.purchaseDate || null,
      expiration: dto.expiration || null,
      value: dto.value ?? undefined,
      price: dto.price ?? undefined,
      supplier: dto.supplier || null,
      warranty: dto.warranty || null,
      notes: dto.notes || null,
      imageUrl: dto.imageUrl || null,
      user: { connect: { id: userId } },
      room: { connect: { id: room.id } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      // If houseId exists, connect it
      ...(houseId ? { house: { connect: { id: houseId } } } : {}),
    } as unknown as Prisma.ItemCreateInput;

    const item = await this.prisma.item.create({ data });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.ITEM_CREATED,
      `Created item: ${item.name}`,
      `Created item "${item.name}" in room ${room.name}`,
      { itemId: item.id, roomId: room.id, categoryId },
    );

    return item;
  }

  private async findRoomById(roomId: number, userId: number) {
    return this.prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { ownerId: userId },
          { sharedWith: { some: { userId } } },
          { house: { ownerId: userId } },
          { house: { sharedWith: { some: { userId } } } },
        ],
      },
      include: { house: true },
    });
  }

  private async findOrCreateCategory(categoryName: string) {
    let category = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: categoryName,
          mode: 'insensitive',
        },
      },
    });

    // Create category if it doesn't exist
    if (!category) {
      category = await this.prisma.category.create({
        data: { name: categoryName },
      });
    }

    return category;
  }

  /**
   * Retrieve all items in the database.
   * Items are returned with their associated room, category, and user.
   * @returns An array of all items in the database.
   */
  async findAll() {
    return this.prisma.item.findMany({
      include: { room: true, category: true, user: true },
    });
  }

  async findAllForUser(userId: number) {
    return this.prisma.item.findMany({
      where: { userId },
      include: { room: true, category: true, user: true },
    });
  }

  /**
   * Retrieves an item from the database by its ID.
   * The item is returned with its associated room, category, and user.
   * @param id The ID of the item to retrieve.
   * @returns The item with the given ID, or null if the item does not exist.
   */
  async findById(id: number) {
    return this.prisma.item.findUnique({
      where: { id },
      include: { room: true, category: true, user: true },
    });
  }

  /**
   * Update an existing item in the database.
   * @param id The ID of the item to update.
   * @param userId The ID of the user who is updating the item.
   * @param dto The data to update the item with.
   * @returns The updated item.
   * @throws ForbiddenException If the user is not allowed to update the item.
   */
  async update(id: number, userId: number, dto: UpdateItemDto) {
    // Find room by identifier if room is being updated
    let room;
    if (dto.room !== undefined) {
      room = await this.findRoomById(dto.room, userId);
      if (!room) {
        throw new ForbiddenException('Room not found or access denied.');
      }
    } else {
      // Get current item's room if room is not being changed
      const currentItem = await this.prisma.item.findUnique({
        where: { id },
        include: { room: true },
      });
      if (!currentItem) {
        throw new ForbiddenException('Item not found.');
      }
      room = currentItem.room;
    }

    const canEdit = await this.prisma.userCanEditInRoom(room.id, userId);
    if (!canEdit) {
      throw new ForbiddenException('Not allowed to edit this item.');
    }

    // Find or create category if provided
    let categoryId: number | undefined;
    if (dto.category) {
      const category = await this.findOrCreateCategory(dto.category);
      categoryId = category.id;
    }

    const houseId = room.houseId;
    const dataUpdate: Prisma.ItemUpdateInput = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.brand !== undefined && { brand: dto.brand }),
      ...(dto.model !== undefined && { model: dto.model }),
      ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
      ...(dto.condition !== undefined && { condition: dto.condition }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.quantity && { quantity: dto.quantity }),
      ...(dto.unit !== undefined && { unit: dto.unit }),
      ...(dto.minStock !== undefined && { minStock: dto.minStock }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.isShared !== undefined && { isShared: dto.isShared }),
      ...(dto.sharedWith !== undefined && { sharedWith: dto.sharedWith }),
      ...(dto.visibility !== undefined && { visibility: dto.visibility }),
      ...(dto.purchaseDate !== undefined && { purchaseDate: dto.purchaseDate }),
      ...(dto.expiration !== undefined && { expiration: dto.expiration }),
      ...(dto.value !== undefined && { value: dto.value }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.supplier !== undefined && { supplier: dto.supplier }),
      ...(dto.warranty !== undefined && { warranty: dto.warranty }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      user: { connect: { id: userId } },
      room: { connect: { id: room.id } },
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      ...(houseId && { house: { connect: { id: houseId } } }),
    } as unknown as Prisma.ItemUpdateInput;

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: dataUpdate,
    });

    // Log activity
    await this.activityService.logActivity(
      userId,
      ActivityType.ITEM_UPDATED,
      `Updated item: ${updatedItem.name}`,
      `Updated item "${updatedItem.name}" in room ${room.name}`,
      { itemId: id, roomId: room.id, categoryId },
    );

    return updatedItem;
  }

  /**
   * Delete an existing item from the database.
   * @param id The ID of the item to delete.
   * @param userId The ID of the user who is deleting the item.
   * @returns The deleted item.
   * @throws ForbiddenException If the user is not allowed to delete the item.
   */
  async remove(id: number, userId: number) {
    const item = await this.prisma.item.findUnique({ where: { id } });

    const deletedItem = await this.prisma.item.delete({
      where: { id, userId },
    });

    // Log activity
    if (item) {
      await this.activityService.logActivity(
        userId,
        ActivityType.ITEM_DELETED,
        `Deleted item: ${item.name}`,
        `Deleted item "${item.name}" from room ${item.roomId}`,
        { itemId: id, roomId: item.roomId },
      );
    }

    return deletedItem;
  }

  /**
   * Get all low stock items for a user.
   * An item is considered low stock when its quantity is below 3.
   * @param userId The ID of the user to get low stock items for.
   * @returns An array of low stock items.
   */
  async findLowStockItems(userId: number) {
    return this.prisma.item.findMany({
      where: {
        userId,
        quantity: {
          lt: 2,
        },
        minStock: {
          not: null,
        },
      },
      include: { room: true, category: true, user: true },
      orderBy: [{ quantity: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get recently created or updated items for a user.
   * Returns items created or updated in the last 7 days.
   * @param userId The ID of the user to get recent items for.
   * @param days Number of days to look back (default: 7).
   * @returns An array of recently created/updated items.
   */
  async findRecentItems(userId: number, days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.prisma.item.findMany({
      where: {
        userId,
        OR: [
          {
            createdAt: {
              gte: cutoffDate,
            },
          },
          {
            updatedAt: {
              gte: cutoffDate,
            },
          },
        ],
      },
      include: { room: true, category: true, user: true },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
