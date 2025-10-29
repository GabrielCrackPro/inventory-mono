import { RoomType, PermissionLevel } from "../models/room";

/**
 * Room creation DTO
 */
export interface CreateRoomDto {
  name: string;
  type?: RoomType;
  houseId: number;
  shared?: boolean;
}

/**
 * Room update DTO
 */
export interface UpdateRoomDto {
  name?: string;
  type?: RoomType;
  shared?: boolean;
}

/**
 * Room sharing DTO
 */
export interface ShareRoomDto {
  userId: number;
  permission?: PermissionLevel;
}

/**
 * Room response DTO
 */
export interface RoomResponseDto {
  id: number;
  name: string;
  type?: RoomType;
  shared?: boolean;
  houseId: number;
  createdAt: Date;
  updatedAt: Date;
  itemCount?: number;
}

/**
 * Room list response DTO
 */
export interface RoomListResponseDto {
  data: RoomResponseDto[];
  total: number;
}
