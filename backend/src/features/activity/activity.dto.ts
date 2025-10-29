import { ActivityType } from '@inventory/shared';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  CreateActivityDto as ICreateActivityDto,
  GetActivitiesDto as IGetActivitiesDto,
  ActivityResponseDto as IActivityResponseDto,
  ActivityListResponseDto as IActivityListResponseDto,
} from '@inventory/shared';

export class CreateActivityDto implements ICreateActivityDto {
  @IsString()
  @ApiProperty({ example: 'Item Created' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'User created a new item' })
  description?: string;

  @IsEnum(ActivityType)
  @ApiProperty({ enum: ActivityType })
  type: ActivityType;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: { itemId: 1 } })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  userAgent?: string;
}

export class GetActivitiesDto implements IGetActivitiesDto {
  @IsOptional()
  @IsEnum(ActivityType)
  @ApiPropertyOptional({ enum: ActivityType })
  type?: ActivityType;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2023-01-01T00:00:00Z' })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2023-12-31T23:59:59Z' })
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 50, default: 50 })
  limit?: number = 50;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 0, default: 0 })
  offset?: number = 0;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  userId?: number;
}

export class ActivityResponseDto implements IActivityResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Item Created' })
  name: string;

  @ApiProperty({ example: 'User created a new item' })
  description: string;

  @ApiProperty({ enum: ActivityType })
  type: ActivityType;

  @ApiPropertyOptional({ example: { itemId: 1 } })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress?: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({
    example: {
      id: 1,
      name: 'John Doe',
      email: 'user@example.com',
    },
  })
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export class ActivityListResponseDto implements IActivityListResponseDto {
  @ApiProperty({ type: [ActivityResponseDto] })
  data: ActivityResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
