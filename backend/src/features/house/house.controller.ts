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
import { JwtUser } from '@inventory/shared';
import { ApiDocs } from '../../shared';
import { GetUser } from '../auth';
import { JwtAuthGuard, RolesGuard } from '../../shared';
import {
  CreateHouseDto,
  HouseListResponseDto,
  HouseResponseDto,
  ShareHouseDto,
  UpdateHouseDto,
} from './house.dto';
import { HouseService } from './house.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiDocs({ tags: ['houses'], bearer: true })
@Controller('api/houses')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @Get()
  @ApiDocs({
    summary: 'Get all houses for the authenticated user',
    responses: [
      {
        status: 200,
        description: 'List of houses',
        type: HouseListResponseDto,
      },
    ],
  })
  findAll(@GetUser() user: JwtUser) {
    return this.houseService.findAllForUser(user.id);
  }

  @Get(':id')
  @ApiDocs({
    summary: 'Get a house by ID',
    responses: [
      {
        status: 200,
        description: 'House details',
        type: HouseResponseDto,
      },
    ],
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.houseService.findOne(id);
  }

  @Post()
  @ApiDocs({
    summary: 'Create a new house',
    responses: [
      {
        status: 201,
        description: 'House created',
        type: HouseResponseDto,
      },
    ],
  })
  create(@Body() dto: CreateHouseDto) {
    return this.houseService.create(dto);
  }

  @Patch(':id')
  @ApiDocs({
    summary: 'Update a house by ID',
    responses: [
      {
        status: 200,
        description: 'House updated',
        type: HouseResponseDto,
      },
    ],
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHouseDto,
    @GetUser() user: JwtUser,
  ) {
    return this.houseService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiDocs({
    summary: 'Delete a house by ID',
    responses: [
      {
        status: 200,
        description: 'House deleted',
      },
    ],
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser,
  ) {
    return this.houseService.remove(id, user.id);
  }

  @Post(':id/share')
  @ApiDocs({
    summary: 'Share a house with another user',
    responses: [
      {
        status: 200,
        description: 'House shared',
      },
    ],
  })
  async share(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ShareHouseDto,
    @GetUser() user: JwtUser,
  ) {
    return this.houseService.share(id, dto, user.id);
  }

  @Delete(':id/access/:userId')
  @ApiDocs({
    summary: "Revoke a user's access to a house",
    responses: [
      {
        status: 200,
        description: 'Access revoked',
      },
    ],
  })
  async revokeAccess(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @GetUser() user: JwtUser,
  ) {
    return this.houseService.revokeAccess(id, targetUserId, user.id);
  }
}
