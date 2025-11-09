/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

/**
 * Base user interface
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User for authentication purposes
 */
export interface AuthUser extends Omit<User, "createdAt" | "updatedAt"> {
  houseIds: number[];
  selectedHouseId: number | null;
  stats: {
    items: number;
    rooms: number;
    categories: number;
    lowStockItems: number;
  };
}

/**
 * User login credentials
 */
export type UserLogin = Pick<User, "email"> & {
  password: string;
  id?: number;
};

/**
 * User creation data
 */
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User update data
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  preferences?: Record<string, any>;
}
