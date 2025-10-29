import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtUser } from '@inventory/shared';
import { ApiDocs } from '../../shared';
import { GetUser } from '../auth';
import { JwtAuthGuard, RolesGuard } from '../../shared';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { ItemService } from './item.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiDocs({ tags: ['items'], bearer: true })
@Controller('api/items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @ApiDocs({
    summary: 'Create a new item',
    responses: [{ status: 201, description: 'Item created' }],
  })
  /**
   * Create a new item in the database.
   * @param data The data to create the item with.
   * @returns The newly created item.
   * @throws ForbiddenException If the user is not allowed to create items in the room.
   */
  async create(@Body() data: CreateItemDto, @GetUser() user: JwtUser) {
    try {
      return await this.itemService.create(user.id, data);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Re-throw other errors to be handled by global exception filter
      throw error;
    }
  }

  @Get()
  @ApiDocs({
    summary: 'Get all items for the authenticated user',
    responses: [{ status: 200, description: 'List of user items' }],
  })
  /**
   * Get all items for the authenticated user.
   */
  async findAll(@GetUser() user: JwtUser) {
    return this.itemService.findAllForUser(user.id);
  }

  @Get('low-stock')
  @ApiDocs({
    summary: 'Get all low stock items for the authenticated user',
    responses: [{ status: 200, description: 'List of low stock items' }],
  })
  /**
   * Get all low stock items for the authenticated user.
   * An item is considered low stock when its quantity is below 3.
   */
  findLowStockItems(@GetUser() user: JwtUser) {
    return this.itemService.findLowStockItems(user.id);
  }

  @Get('recent')
  @ApiDocs({
    summary: 'Get recently created or updated items for the authenticated user',
    responses: [{ status: 200, description: 'List of recent items' }],
  })
  /**
   * Get recently created or updated items for the authenticated user.
   * Returns items created or updated in the last 7 days.
   */
  findRecentItems(@GetUser() user: JwtUser) {
    return this.itemService.findRecentItems(user.id);
  }

  @Get(':id')
  @ApiDocs({
    summary: 'Get a single item by its ID',
    responses: [{ status: 200, description: 'Item details' }],
  })
  /**
   * Get a single item by its ID.
   * @param id The ID of the item to get.
   * @returns The item with the given ID.
   * @throws ForbiddenException If the user is not allowed to view the item.
   */
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.findById(id);
  }

  @Patch(':id')
  @ApiDocs({
    summary: 'Update an existing item',
    responses: [{ status: 200, description: 'Updated item' }],
  })
  /**
   * Update an existing item in the database.
   * @param id The ID of the item to update.
   * @param data The data to update the item with.
   * @returns The updated item.
   * @throws ForbiddenException If the user is not allowed to update the item.
   */
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateItemDto,
    @GetUser() user: JwtUser,
  ) {
    try {
      return await this.itemService.update(id, user.id, data);
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new ForbiddenException('Cannot update item');
    }
  }

  @Delete(':id')
  @ApiDocs({
    summary: 'Delete an existing item',
    responses: [{ status: 200, description: 'Deleted item' }],
  })
  /**
   * Delete an existing item in the database.
   * @param id The ID of the item to delete.
   * @param userId The ID of the user who is deleting the item.
   * @returns The deleted item.
   * @throws ForbiddenException If the user is not allowed to delete the item.
   */
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser,
  ) {
    try {
      return await this.itemService.remove(id, user.id);
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new ForbiddenException('Cannot delete item');
    }
  }
}
