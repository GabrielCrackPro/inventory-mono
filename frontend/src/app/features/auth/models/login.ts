import { AuthUser } from '@shared/models';
import type { LoginDto, AuthResponseDto } from '@inventory/shared';

// Re-export shared types
export type LoginRequest = LoginDto;

// Frontend-specific response type (extends shared)
export interface LoginResponse extends Omit<AuthResponseDto, 'user'> {
  expires_at: number;
  refresh_token_expires_at: number;
  user: AuthUser;
}

export interface LogoutRequest {
  id: number;
  jti?: string;
  exp?: number;
}
