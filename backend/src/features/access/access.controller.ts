import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared';
import { GetUser } from '../auth/auth.decorator';
import { AccessService } from './access.service';
import { PermissionLevel } from '@prisma/client';

function toCaps(level: PermissionLevel | null): PermissionLevel | null {
  return level ? (String(level).toUpperCase() as PermissionLevel) : null;
}

function toEffective(level: PermissionLevel | null) {
  const L = toCaps(level);
  return {
    level: L,
    canRead:
      L === PermissionLevel.VIEW ||
      L === PermissionLevel.EDIT ||
      L === PermissionLevel.ADMIN,
    canEdit: L === PermissionLevel.EDIT || L === PermissionLevel.ADMIN,
    canAdmin: L === PermissionLevel.ADMIN,
  };
}

@Controller('api/access')
@UseGuards(JwtAuthGuard)
export class AccessController {
  constructor(private readonly access: AccessService) {}

  @Get('house/:id')
  async house(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const level = await this.access.getHousePermission(userId, id);
    return toEffective(level);
  }

  @Get('room/:id')
  async room(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const level = await this.access.getRoomPermission(userId, id);
    return toEffective(level);
  }

  @Get('item/:id')
  async item(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const level = await this.access.getItemPermission(userId, id);
    return toEffective(level);
  }
}
