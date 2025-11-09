import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService, TokenService } from '@core/services';
import { ApiService } from '@core/services';
import { tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RegisterRequest,
  RegisterResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _apiService = inject(ApiService);
  private readonly _tokenService = inject(TokenService);
  private readonly _storageService = inject(StorageService);
  private readonly _router = inject(Router);

  /**
   * Registers a new user to the system.
   * @param {RegisterRequest} body - The request body containing the user information.
   * @returns {Observable<RegisterResponse>} - An observable containing the response data of type RegisterResponse.
   */
  register({ name, email, password, role }: RegisterRequest) {
    return this._apiService.post<RegisterResponse, RegisterRequest>('register', {
      name,
      email,
      password,
      role,
    });
  }

  /**
   * Logs in a user to the system.
   * @param {LoginRequest} body - The request body containing the user credentials.
   * @returns {Observable<LoginResponse>} - An observable containing the response data of type LoginResponse.
   * @description This method sends a POST request to the login endpoint with the user credentials.
   * It then takes the access token and refresh token from the response and stores them in the token service.
   */
  login({ email, password }: LoginRequest) {
    return this._apiService
      .post<LoginResponse, LoginRequest>('login', {
        email,
        password,
      })
      .pipe(
        tap(({ access_token, refresh_token, jti, expires_at, refresh_token_expires_at }) => {
          this._tokenService.setTokens({
            accessToken: access_token,
            refreshToken: refresh_token,
            jti,
          });

          this._tokenService.setExpiresAt({
            expiresAt: expires_at.toString(),
            refreshExpiresAt: refresh_token_expires_at?.toString(),
          });
        })
      );
  }

  logout({ id, jti, exp }: LogoutRequest) {
    return this._apiService.post<void, LogoutRequest>('logout', {
      id,
      jti,
      exp,
    });
  }

  /**
   * Requests a password reset email to be sent to the user.
   */
  forgotPassword(email: string) {
    return this._apiService.post<{ ok: boolean }, { email: string }>('forgotPassword', {
      email,
    });
  }

  /**
   * Resets the password using a token from the email link.
   */
  resetPassword(token: string, password: string) {
    return this._apiService.post<{ ok: boolean }, { token: string; password: string }>('resetPassword', {
      token,
      password,
    });
  }

  /**
   * Verifies the user's email using a 6-digit code.
   */
  verifyEmail(email: string, code: string) {
    return this._apiService.post<{ ok: boolean }, { email: string; code: string }>('verifyEmail', {
      email,
      code,
    });
  }

  /**
   * Resends the email verification code to the given email.
   */
  resendVerification(email: string) {
    return this._apiService.post<{ ok: boolean }, { email: string }>('resendVerification', {
      email,
    });
  }

  /**
   * Checks if the user is authenticated (delegates to TokenService).
   */
  isAuthenticated(): boolean {
    return this._tokenService.isAuthenticated();
  }

  /**
   * Convenience to logout locally without calling API (useful when 401 occurs).
   */
  logoutLocal() {
    this._storageService.clear();
    this._router.navigate(['/auth/login']);
  }
}
