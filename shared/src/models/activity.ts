/**
 * Activity type enumeration
 */
export enum ActivityType {
  // Item activities
  ITEM_CREATED = "ITEM_CREATED",
  ITEM_UPDATED = "ITEM_UPDATED",
  ITEM_DELETED = "ITEM_DELETED",

  // Room activities
  ROOM_CREATED = "ROOM_CREATED",
  ROOM_UPDATED = "ROOM_UPDATED",
  ROOM_DELETED = "ROOM_DELETED",
  ROOM_SHARED = "ROOM_SHARED",

  // House activities
  HOUSE_CREATED = "HOUSE_CREATED",
  HOUSE_UPDATED = "HOUSE_UPDATED",
  HOUSE_DELETED = "HOUSE_DELETED",
  HOUSE_SHARED = "HOUSE_SHARED",

  // User activities
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTERED = "USER_REGISTERED",

  // Category activities
  CATEGORY_CREATED = "CATEGORY_CREATED",
  CATEGORY_UPDATED = "CATEGORY_UPDATED",
  CATEGORY_DELETED = "CATEGORY_DELETED",

  // Stock activities
  LOW_STOCK = "LOW_STOCK",
  STOCK_UPDATED = "STOCK_UPDATED",
}

/**
 * Base activity interface
 */
export interface Activity {
  id: number;
  name: string;
  description: string;
  type: ActivityType;
  metadata?: any;
  ipAddress?: string;
  createdAt: Date;
  userId: number;
}

/**
 * Activity with user information
 */
export interface ActivityWithUser extends Activity {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * User activity for frontend display
 */
export interface UserActivity {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  ipAddress: string;
  metadata: any;
  type: ActivityType;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * Activity creation data
 */
export interface CreateActivityData {
  name: string;
  description: string;
  type: ActivityType;
  metadata?: any;
  ipAddress?: string;
  userId: number;
}
