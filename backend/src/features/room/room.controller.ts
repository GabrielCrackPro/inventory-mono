import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtUser, UserRole } from '@inventory/shared';
import { ApiDocs } from '../../shared';
import { GetUser, Roles } from '../auth';
import { JwtAuthGuard, RolesGuard } from '../../shared';
import { CreateRoomDto, ShareRoomDto, UpdateRoomDto } from './room.dto';
import { RoomService } from './room.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiDocs({ tags: ['rooms'], bearer: true })
@Controller('api/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @ApiDocs({
    summary: 'Get all rooms for the authenticated user',
    responses: [{ status: 200, description: 'List of rooms' }],
  })
  findAll(@GetUser() user: JwtUser) {
    return this.roomService.findAllForUser(user.id);
  }

  @Get('house/:houseId')
  @ApiDocs({
    summary: 'Get all rooms for a specific house',
    responses: [{ status: 200, description: 'List of rooms in the house' }],
  })
  findByHouse(
    @Param('houseId', ParseIntPipe) houseId: number,
    @GetUser() user: JwtUser,
  ) {
    return this.roomService.findAllForUserInHouse(user.id, houseId);
  }

  @Get(':id')
  @ApiDocs({
    summary: 'Get a room by ID',
    responses: [{ status: 200, description: 'Room details' }],
  })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: JwtUser) {
    return this.roomService.findOne(id, user.id);
  }

  @Post()
  @ApiDocs({
    summary: 'Create a new room',
    responses: [{ status: 201, description: 'Room created' }],
  })
  create(@Body() dto: CreateRoomDto, @GetUser() user: JwtUser) {
    return this.roomService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiDocs({
    summary: 'Update a room by ID',
    responses: [{ status: 200, description: 'Room updated' }],
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
    @GetUser() user: JwtUser,
  ) {
    return this.roomService.update(id, user.id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDocs({
    summary: 'Delete a room by ID',
    responses: [{ status: 200, description: 'Room deleted' }],
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser,
  ) {
    return this.roomService.remove(id, user.id);
  }

  @Post(':id/share')
  @ApiDocs({
    summary: 'Share a room with another user',
    responses: [{ status: 201, description: 'Room shared successfully' }],
  })
  async share(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ShareRoomDto,
    @GetUser() user: JwtUser,
  ) {
    return this.roomService.share(id, dto, user.id);
  }

  @Delete(':id/share/:userId')
  @ApiDocs({
    summary: 'Revoke room access from a user',
    responses: [{ status: 200, description: 'Room access revoked' }],
  })
  async revokeAccess(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @GetUser() user: JwtUser,
  ) {
    return this.roomService.revokeAccess(id, targetUserId, user.id);
  }
}
