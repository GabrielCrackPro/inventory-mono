// Models
export * from "./models/user";
export * from "./models/house";
export * from "./models/room";
export * from "./models/item";
export * from "./models/activity";
export * from "./models/auth";
export * from "./models/api";
export * from "./models/notification";
export * from "./models/category";

// DTOs
export * from "./dtos";

// Types
export * from "./types/common";
export * from "./types/frontend";

// Re-export commonly used types for convenience
export type {
  User,
  AuthUser,
  CreateUserData,
  UpdateUserData,
} from "./models/user";

export { UserRole } from "./models/user";

export type {
  House,
  HouseWithRelations,
  CreateHouseData,
  UpdateHouseData,
} from "./models/house";

export { HousePermission } from "./models/house";

export type {
  Room,
  RoomWithRelations,
  CreateRoomData,
  UpdateRoomData,
} from "./models/room";

export { RoomType, PermissionLevel } from "./models/room";

export type {
  Item,
  ItemWithRelations,
  CreateItemData,
  UpdateItemData,
} from "./models/item";

export { ItemCondition, ItemVisibility } from "./models/item";

export type {
  Activity,
  ActivityWithUser,
  CreateActivityData,
} from "./models/activity";

export { ActivityType } from "./models/activity";

export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  JwtPayload,
  JwtUser,
} from "./models/auth";

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
} from "./models/api";

export type {
  Notification,
  ToastType,
  ToastOptions,
} from "./models/notification";

export { NotificationType } from "./models/notification";

export type {
  Category,
  CategoryWithRelations,
  CreateCategoryData,
  UpdateCategoryData,
} from "./models/category";
