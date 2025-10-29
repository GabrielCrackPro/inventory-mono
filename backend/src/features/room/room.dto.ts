import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, PermissionLevel } from '@inventory/shared';
import type {
  CreateRoomDto as ICreateRoomDto,
  UpdateRoomDto as IUpdateRoomDto,
  ShareRoomDto as IShareRoomDto,
  RoomResponseDto as IRoomResponseDto,
  RoomListResponseDto as IRoomListResponseDto,
} from '@inventory/shared';

export class CreateRoomDto implements ICreateRoomDto {
  @IsString()
  @ApiProperty({ example: 'Living Room' })
  name: string;

  @IsOptional()
  @IsEnum(RoomType)
  @ApiPropertyOptional({ enum: RoomType })
  type?: RoomType;

  @IsInt()
  @ApiProperty({ example: 1 })
  houseId: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  shared?: boolean;
}

export class UpdateRoomDto
  extends PartialType(CreateRoomDto)
  implements IUpdateRoomDto {}

export class ShareRoomDto implements IShareRoomDto {
  @IsInt()
  @ApiProperty({ example: 2 })
  userId: number;

  @IsOptional()
  @IsEnum(PermissionLevel)
  @ApiPropertyOptional({ enum: PermissionLevel, example: PermissionLevel.VIEW })
  permission?: PermissionLevel;
}

export class RoomResponseDto implements IRoomResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Living Room' })
  name: string;

  @ApiPropertyOptional({ enum: RoomType })
  type?: RoomType;

  @ApiPropertyOptional({ example: false })
  shared?: boolean;

  @ApiProperty({ example: 1 })
  houseId: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: 5 })
  itemCount?: number;
}

export class RoomListResponseDto implements IRoomListResponseDto {
  @ApiProperty({ type: [RoomResponseDto] })
  data: RoomResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
