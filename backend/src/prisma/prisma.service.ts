import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Checks if a user is allowed to edit an item in a room.
   * @param roomId The ID of the room to check.
   * @param userId The ID of the user to check.
   * @returns True if the user is allowed to edit the item, false otherwise.
   */
  async userCanEditInRoom(roomId: number, userId: number) {
    if (!roomId || !userId) return false;

    // Read the room and select houseId explicitly (houseId may be optional)
    const room = await this.room.findUnique({
      where: { id: roomId },
      select: { id: true, ownerId: true, houseId: true },
    });

    if (!room) return false;

    // Check if user is the room owner
    if (room.ownerId === userId) return true;

    // Check room-level access
    const roomAccess = await this.roomAccess.findFirst({
      where: { roomId, userId },
    });
    if (roomAccess) return true;

    // If room belongs to a house, check house access
    if (room.houseId) {
      // Check if user is the house owner
      const house = await this.house.findUnique({
        where: { id: room.houseId },
        select: { ownerId: true },
      });

      if (house && house.ownerId === userId) return true;

      // Check if user has shared access to the house
      const houseAccess = await this.houseAccess.findFirst({
        where: { houseId: room.houseId, userId },
      });
      if (houseAccess) return true;
    }

    return false;
  }
}
