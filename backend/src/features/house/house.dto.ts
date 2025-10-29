import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HousePermission } from '@inventory/shared';
import type {
  CreateHouseDto as ICreateHouseDto,
  UpdateHouseDto as IUpdateHouseDto,
  ShareHouseDto as IShareHouseDto,
  HouseResponseDto as IHouseResponseDto,
  HouseListResponseDto as IHouseListResponseDto,
} from '@inventory/shared';

export class CreateHouseDto implements ICreateHouseDto {
  @IsString()
  @ApiProperty({ example: 'My House' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '123 Main St' })
  address?: string;

  @IsInt()
  @ApiProperty({ example: 1 })
  ownerId: number;
}

export class UpdateHouseDto implements IUpdateHouseDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Updated House' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '456 New St' })
  address?: string;
}

export class ShareHouseDto implements IShareHouseDto {
  @IsInt()
  @ApiProperty({ example: 2 })
  userId: number;

  @IsEnum(HousePermission)
  @ApiProperty({ enum: HousePermission })
  permission: HousePermission;
}

export class HouseResponseDto implements IHouseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'My House' })
  name: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  address?: string;

  @ApiProperty({ example: 1 })
  ownerId: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}

export class HouseListResponseDto implements IHouseListResponseDto {
  @ApiProperty({ type: [HouseResponseDto] })
  data: HouseResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
