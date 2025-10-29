import { AuthUser } from '@shared/models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  jti: string;
  expires_at: number;
  refresh_token_expires_at: number;
  user: AuthUser;
}

export interface LogoutRequest {
  id: number;
  jti?: string;
  exp?: number;
}
