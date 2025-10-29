/**
 * Item condition enumeration
 */
export enum ItemCondition {
  NEW = "NEW",
  USED = "USED",
  DAMAGED = "DAMAGED",
}

/**
 * Item visibility enumeration
 */
export enum ItemVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
  SHARED = "shared",
}

/**
 * Base item interface
 */
export interface Item {
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
 * Item with related data
 */
export interface ItemWithRelations extends Item {
  user?: any;
  room?: any;
  house?: any;
  category?: any;
}

/**
 * Item creation data
 */
export interface CreateItemData {
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
  roomId: number;
  houseId: number;
  categoryId?: number;
}

/**
 * Item update data
 */
export interface UpdateItemData {
  name?: string;
  description?: string;
  quantity?: number;
  condition?: ItemCondition;
  purchaseDate?: Date;
  expiration?: Date;
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
 * Item search/filter criteria
 */
export interface ItemSearchCriteria {
  name?: string;
  condition?: ItemCondition;
  roomId?: number;
  houseId?: number;
  categoryId?: number;
  minQuantity?: number;
  maxQuantity?: number;
  hasExpiration?: boolean;
  isExpired?: boolean;
}
