import { ItemCondition, ItemVisibility } from "../models/item";

/**
 * Item creation DTO
 */
export interface CreateItemDto {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition?: ItemCondition;
  room: number; // Room ID
  location?: string;
  quantity: number;
  unit?: string;
  minStock?: number;
  tags?: string[];
  isShared?: boolean;
  sharedWith?: string[];
  visibility?: ItemVisibility;
  purchaseDate?: string;
  expiration?: string;
  value?: number;
  price?: number;
  supplier?: string;
  warranty?: string;
  notes?: string;
  imageUrl?: string;
  roomId: number;
  houseId: number;
  categoryId?: number;
}

/**
 * Item update DTO
 */
export interface UpdateItemDto {
  name?: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition?: ItemCondition;
  room?: number; // Room ID
  location?: string;
  quantity?: number;
  unit?: string;
  minStock?: number;
  tags?: string[];
  isShared?: boolean;
  sharedWith?: string[];
  visibility?: ItemVisibility;
  purchaseDate?: string;
  expiration?: string;
  value?: number;
  price?: number;
  supplier?: string;
  warranty?: string;
  notes?: string;
  imageUrl?: string;
  roomId?: number;
  categoryId?: number;
}

/**
 * Item response DTO
 */
export interface ItemResponseDto {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  condition: ItemCondition;
  purchaseDate?: Date;
  expiration?: Date;
  value?: number;
  price?: number;
  supplier?: string;
  warranty?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  roomId: number;
  houseId: number;
  categoryId?: number;
}

/**
 * Item list response DTO
 */
export interface ItemListResponseDto {
  data: ItemResponseDto[];
  total: number;
}

/**
 * Item search DTO
 */
export interface ItemSearchDto {
  name?: string;
  condition?: ItemCondition;
  roomId?: number;
  houseId?: number;
  categoryId?: number;
  minQuantity?: number;
  maxQuantity?: number;
  hasExpiration?: boolean;
  isExpired?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}
