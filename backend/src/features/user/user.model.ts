// Re-export shared types for backward compatibility
export type {
  User,
  AuthUser,
  UserLogin,
  CreateUserData,
  UpdateUserData,
} from '@inventory/shared';

export { UserRole as Role } from '@inventory/shared'; // Alias for backward compatibility
