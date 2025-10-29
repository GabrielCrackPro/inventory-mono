import { HousePermission } from "../models/house";

/**
 * House creation DTO
 */
export interface CreateHouseDto {
  name: string;
  address?: string;
  ownerId: number;
}

/**
 * House update DTO
 */
export interface UpdateHouseDto {
  name?: string;
  address?: string;
}

/**
 * House sharing DTO
 */
export interface ShareHouseDto {
  userId: number;
  permission: HousePermission;
}

/**
 * House response DTO
 */
export interface HouseResponseDto {
  id: number;
  name: string;
  address?: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * House list response DTO
 */
export interface HouseListResponseDto {
  data: HouseResponseDto[];
  total: number;
}
