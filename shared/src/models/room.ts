/**
 * Room type enumeration
 */
export enum RoomType {
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
}

/**
 * Permission level enumeration
 */
export enum PermissionLevel {
  VIEW = "VIEW",
  EDIT = "EDIT",
  ADMIN = "ADMIN",
}

/**
 * Base room interface
 */
export interface Room {
  id: number;
  name: string;
  type?: RoomType;
  shared?: boolean;
  createdAt: Date;
  updatedAt: Date;
  houseId: number;
}

/**
 * Room with related data
 */
export interface RoomWithRelations extends Room {
  items?: any[];
  house?: any;
}

/**
 * Room creation data
 */
export interface CreateRoomData {
  name: string;
  type?: RoomType;
  shared?: boolean;
  houseId: number;
}

/**
 * Room update data
 */
export interface UpdateRoomData {
  name?: string;
  type?: RoomType;
  shared?: boolean;
}

/**
 * Room sharing data
 */
export interface ShareRoomData {
  userId: number;
  permission?: PermissionLevel;
}

/**
 * Room display data for UI components
 */
export interface RoomDisplayData {
  name: string;
  type: string;
  itemCount?: number;
}

/**
 * Room type information for UI
 */
export interface RoomTypeInfo {
  type: string;
  placeholders: string[];
}
