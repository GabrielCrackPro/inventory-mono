import { UserRole } from '@shared/models';
import type { RegisterDto } from '@inventory/shared';

// Re-export shared type
export type RegisterRequest = RegisterDto;

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
