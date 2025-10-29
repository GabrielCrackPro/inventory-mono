import { UserRole } from "./user";

/**
 * Authentication request data
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request data
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Authentication response data
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Token refresh request
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Authenticated user for controllers (from JWT)
 */
export interface JwtUser {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}
