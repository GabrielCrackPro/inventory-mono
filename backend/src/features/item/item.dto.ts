import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemCondition, ItemVisibility } from '@inventory/shared';
import type {
  CreateItemDto as ICreateItemDto,
  UpdateItemDto as IUpdateItemDto,
  ItemResponseDto as IItemResponseDto,
  ItemListResponseDto as IItemListResponseDto,
  ItemSearchDto as IItemSearchDto,
} from '@inventory/shared';

export class CreateItemDto implements ICreateItemDto {
  @IsString()
  @ApiProperty({ example: 'Laptop' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'MacBook Pro 13-inch' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Electronics' })
  category?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Apple' })
  brand?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'MacBook Pro' })
  model?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'ABC123456' })
  serialNumber?: string;

  @IsOptional()
  @IsEnum(ItemCondition)
  @ApiPropertyOptional({ enum: ItemCondition })
  condition?: ItemCondition;

  @IsInt()
  @ApiProperty({ example: 1, description: 'Room ID' })
  room: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Desk drawer' })
  location?: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  quantity: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'piece' })
  unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 0 })
  minStock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value || [])
  @ApiPropertyOptional({ example: ['electronics', 'work'] })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  isShared?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value || [])
  @ApiPropertyOptional({ example: ['user@example.com'] })
  sharedWith?: string[];

  @IsOptional()
  @IsEnum(ItemVisibility)
  @ApiPropertyOptional({ example: 'private' })
  visibility?: ItemVisibility;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2023-01-01' })
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2025-01-01' })
  expiration?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 1200 })
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 1200 })
  price?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Apple Store' })
  supplier?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '2 years' })
  warranty?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Work laptop' })
  notes?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  imageUrl?: string;

  @IsInt()
  @ApiProperty({ example: 1 })
  roomId: number;

  @IsInt()
  @ApiProperty({ example: 1 })
  houseId: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  categoryId?: number;
}

export class DeleteMultipleItemsDto {
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v: any) => Number(v)) : [],
  )
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  ids: number[];
}

export class UpdateItemDto
  extends PartialType(CreateItemDto)
  implements IUpdateItemDto {}

export class ItemResponseDto implements IItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiPropertyOptional({ example: 'MacBook Pro 13-inch' })
  description?: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ enum: ItemCondition })
  condition: ItemCondition;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  purchaseDate?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  expiration?: Date;

  @ApiPropertyOptional({ example: 1200 })
  value?: number;

  @ApiPropertyOptional({ example: 1200 })
  price?: number;

  @ApiPropertyOptional({ example: 'Apple Store' })
  supplier?: string;

  @ApiPropertyOptional({ example: '2 years' })
  warranty?: string;

  @ApiPropertyOptional({ example: 'Work laptop' })
  notes?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  imageUrl?: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  roomId: number;

  @ApiProperty({ example: 1 })
  houseId: number;

  @ApiPropertyOptional({ example: 1 })
  categoryId?: number;
}

export class ItemListResponseDto implements IItemListResponseDto {
  @ApiProperty({ type: [ItemResponseDto] })
  data: ItemResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}

export class ItemSearchDto implements IItemSearchDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'laptop' })
  name?: string;

  @IsOptional()
  @IsEnum(ItemCondition)
  @ApiPropertyOptional({ enum: ItemCondition })
  condition?: ItemCondition;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  roomId?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  houseId?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 1 })
  minQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 10 })
  maxQuantity?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  hasExpiration?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  isExpired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ example: ['electronics', 'work'] })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 50, default: 50 })
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 0, default: 0 })
  offset?: number;
}
