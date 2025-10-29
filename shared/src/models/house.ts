/**
 * House permission levels
 */
export enum HousePermission {
  VIEW = "VIEW",
  EDIT = "EDIT",
  ADMIN = "ADMIN",
}

/**
 * Base house interface
 */
export interface House {
  id: number;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: number;
}

/**
 * House with related data
 */
export interface HouseWithRelations extends House {
  rooms?: any[];
  items?: any[];
  members?: any[];
}

/**
 * House creation data
 */
export interface CreateHouseData {
  name: string;
  address?: string;
  ownerId: number;
}

/**
 * House update data
 */
export interface UpdateHouseData {
  name?: string;
  address?: string;
}

/**
 * House sharing data
 */
export interface ShareHouseData {
  userId: number;
  permission: HousePermission;
}

/**
 * House access information
 */
export interface HouseAccess {
  id: number;
  houseId: number;
  userId: number;
  permission: HousePermission;
  createdAt: Date;
}
