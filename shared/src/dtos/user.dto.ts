import { UserRole } from "../models/user";

/**
 * User creation DTO
 */
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User update DTO
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  preferences?: Record<string, any>;
}

/**
 * User response DTO
 */
export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User list response DTO
 */
export interface UserListResponseDto {
  data: UserResponseDto[];
  total: number;
}
