import { UserRole } from "../models/user";

/**
 * User registration DTO
 */
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Token refresh DTO
 */
export interface RefreshDto {
  userId: number;
  refreshToken: string;
}

/**
 * Authentication response DTO
 */
export interface AuthResponseDto {
  access_token: string;
  refresh_token: string;
  jti: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Token refresh response DTO
 */
export interface RefreshResponseDto {
  access_token: string;
  refresh_token: string;
  jti: string;
}

/**
 * Password reset request DTO
 */
export interface PasswordResetRequestDto {
  email: string;
}

/**
 * Password reset confirmation DTO
 */
export interface PasswordResetConfirmDto {
  token: string;
  newPassword: string;
}
