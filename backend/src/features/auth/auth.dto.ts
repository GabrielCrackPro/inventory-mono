import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '@inventory/shared';
import type {
  RegisterDto as IRegisterDto,
  LoginDto as ILoginDto,
  RefreshDto as IRefreshDto,
  AuthResponseDto as IAuthResponseDto,
  RefreshResponseDto as IRefreshResponseDto,
} from '@inventory/shared';

export class RegisterDto implements IRegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  @ApiPropertyOptional({ enum: UserRole, default: UserRole.MEMBER })
  role?: UserRole;
}

export class LoginDto implements ILoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshDto implements IRefreshDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'refresh-token' })
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto implements IAuthResponseDto {
  @ApiProperty({ example: 'access-token' })
  access_token: string;

  @ApiProperty({ example: 'refresh-token' })
  refresh_token: string;

  @ApiProperty({ example: 'uuid-jti' })
  jti: string;

  @ApiProperty({
    example: {
      id: 1,
      name: 'John Doe',
      email: 'user@example.com',
      role: UserRole.MEMBER,
    },
  })
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}

export class RefreshResponseDto implements IRefreshResponseDto {
  @ApiProperty({ example: 'access-token' })
  access_token: string;

  @ApiProperty({ example: 'new-refresh-token' })
  refresh_token: string;

  @ApiProperty({ example: 'uuid-jti' })
  jti: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newStrongPassword' })
  @IsString()
  @MinLength(6)
  password: string;
}

export default {};
