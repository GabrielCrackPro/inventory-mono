import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@inventory/shared';
import type {
  CreateUserDto as ICreateUserDto,
  UpdateUserDto as IUpdateUserDto,
  UserResponseDto as IUserResponseDto,
  UserListResponseDto as IUserListResponseDto,
} from '@inventory/shared';

export class CreateUserDto implements ICreateUserDto {
  @IsString()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  @ApiPropertyOptional({ enum: UserRole, default: UserRole.MEMBER })
  role?: UserRole;
}

export class UpdateUserDto
  extends PartialType(CreateUserDto)
  implements IUpdateUserDto
{
  @IsOptional()
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
  })
  preferences?: Record<string, any>;
}

export class UserResponseDto implements IUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}

export class UserListResponseDto implements IUserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
