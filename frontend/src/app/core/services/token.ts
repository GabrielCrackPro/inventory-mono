import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly _storageService = inject(StorageService);

  private _accessTokenKey = 'access_token';
  private _refreshTokenKey = 'refresh_token';
  private _jtiKey = 'jti';

  private _accessTokenExpiryKey = 'expires_at';
  private _refreshTokenExpiryKey = 'refresh_token_expires_at';

  /**
   * Sets the access token in local storage.
   * @param token - The access token to set.
   */
  setAccessToken(token: string) {
    this._storageService.setItem(this._accessTokenKey, token);
  }

  /**
   * Sets the refresh token in local storage.
   * @param token - The refresh token to set.
   */
  setRefreshToken(token: string) {
    this._storageService.setItem(this._refreshTokenKey, token);
  }

  setJti(jti: string) {
    this._storageService.setItem(this._jtiKey, jti);
  }

  /**
   * Sets both the access token and refresh token in local storage.
   * @param {{ accessToken: string, refreshToken: string }} - An object containing the access token and refresh token.
   * @description This method sets both the access token and refresh token in local storage by calling the respective setter methods.
   */
  setTokens({
    accessToken,
    refreshToken,
    jti,
  }: {
    accessToken: string;
    refreshToken: string;
    jti: string;
  }) {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    this.setJti(jti);
  }

  /**
   * Retrieves the access token from local storage.
   * @returns {string} - The access token from local storage, or null if it doesn't exist.
   * @description This method retrieves the access token from local storage by using the access token key.
   */
  getAccessToken() {
    return this._storageService.getItem<string>(this._accessTokenKey);
  }

  /**
   * Retrieves the refresh token from local storage.
   * @returns {string} - The refresh token from local storage, or null if it doesn't exist.
   * @description This method retrieves the refresh token from local storage by using the refresh token key.
   */
  getRefreshToken() {
    return this._storageService.getItem(this._refreshTokenKey);
  }
  /**
   * Clears both the access token and refresh token from local storage.
   * @description This method clears both the access token and refresh token from local storage by calling the respective removeItem methods on the local storage object.
   */
  clearTokens() {
    this._storageService.batchRemove([
      this._accessTokenKey,
      this._refreshTokenKey,
      this._jtiKey,
      this._accessTokenExpiryKey,
      this._refreshTokenExpiryKey,
    ]);
  }

  /**
   * Checks if the user is authenticated.
   * @returns {boolean} - True if the user is authenticated, false otherwise.
   * @description This method checks if the user is authenticated by checking if the access token exists in local storage.
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /**
   * Checks if the refresh token is expired.
   * @returns {boolean} - True if the refresh token is expired, false otherwise.
   * @description This method checks if the refresh token is expired by checking if it exists in local storage.
   * If the refresh token doesn't exist in local storage, or if it is undefined, it is considered expired.
   */
  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken();
    return !refreshToken || refreshToken === 'undefined';
  }

  getJti(): string | null {
    return this._storageService.getItem(this._jtiKey);
  }

  /**
   * Decode a JWT and return its payload as an object.
   */
  decodeJwt(token: string | null) {
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      // handle unicode
      const json = decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  /**
   * Returns true if the given token is expired (based on `exp` claim).
   */
  isTokenExpired(token?: string | null): boolean {
    const t = token ?? this.getAccessToken();
    if (!t) return true;
    const payload = this.decodeJwt(t);
    if (!payload || !payload.exp) return true;

    const exp = Number(payload.exp) * 1000;
    return Date.now() >= exp;
  }

  /**
   * Return the decoded access token payload (or null).
   */
  getAccessTokenPayload() {
    return this.decodeJwt(this.getAccessToken());
  }

  /**
   * Sets the expiration times for the access token and refresh token in local storage.
   * @param {{ expiresAt: string, refreshExpiresAt?: string }} - An object containing the expiration times for the access token and refresh token.
   * @description This method sets the expiration times for the access token and refresh token in local storage by using the respective keys.
   * The expiration times are expected to be in the ISO 8601 format (e.g. '2022-01-01T00:00:00.000Z').
   */
  setExpiresAt({ expiresAt, refreshExpiresAt }: { expiresAt: string; refreshExpiresAt?: string }) {
    this._storageService.setItem(this._accessTokenExpiryKey, expiresAt);
    this._storageService.setItem(this._refreshTokenExpiryKey, refreshExpiresAt);
  }
}
