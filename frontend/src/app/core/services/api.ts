import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

export interface ApiEndpoints {
  activity: string;
  register: string;
  login: string;
  logout: string;
  forgotPassword: string;
  resetPassword: string;
  verifyEmail: string;
  resendVerification: string;
  users: string;
  items: string;
  lowStockItems: string;
  recentItems: string;
  rooms: string;
  houses: string;
  stats: string;
  activeHouseRooms: string;
  deleteMultipleItems: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly endpoints: ApiEndpoints = {
    activity: 'activities',
    register: 'auth/register',
    login: 'auth/login',
    logout: 'auth/logout',
    forgotPassword: 'auth/forgot-password',
    resetPassword: 'auth/reset-password',
    verifyEmail: 'auth/verify-email',
    resendVerification: 'auth/resend-verification',
    users: 'users',
    items: 'items',
    lowStockItems: 'items/low-stock',
    recentItems: 'items/recent',
    rooms: 'rooms',
    houses: 'houses',
    stats: 'activities/stadistics',
    activeHouseRooms: 'rooms/house',
    deleteMultipleItems: 'items/delete-multiple',
  };

  /**
   * Builds a URL from the given endpoint and optional path.
   *
   * @param endpoint - The key of the API endpoint to build the URL for.
   * @param path - Optional path to append to the base URL.
   * @returns The built URL.
   */
  private _buildUrl(endpoint: keyof ApiEndpoints, path?: string | number): string {
    const base = `${this.baseUrl}/${this.endpoints[endpoint]}`;
    return path ? `${base}/${path}` : base;
  }

  /**
   * Handles an error by logging it to the console and rethrowing it as a Throwable.
   * @param error - The error to handle.
   * @returns A Throwable containing the error.
   */
  private _handleError(error: any) {
    console.error('[API Error]', error);
    return throwError(() => error);
  }

  /**
   * Performs a GET request to the specified API endpoint.
   *
   * @param endpoint - The key of the API endpoint to request.
   * @param params - Optional HTTP params to include in the request.
   * @param extraPath - Optional path to append to the base URL.
   * @returns An Observable containing the response data of type T.
   */
  get<T>(
    endpoint: keyof ApiEndpoints,
    params?: HttpParams,
    extraPath?: string | number
  ): Observable<T> {
    return this.http
      .get<T>(this._buildUrl(endpoint, extraPath), { params })
      .pipe(catchError(this._handleError));
  }

  /**
   * Retrieves a single item of type T from the specified API endpoint.
   *
   * @param endpoint - The key of the API endpoint to request.
   * @param id - The ID of the item to retrieve.
   * @returns An Observable containing the retrieved item.
   */
  getOne<T>(endpoint: keyof ApiEndpoints, id: string | number): Observable<T> {
    return this.get<T>(endpoint, undefined, id);
  }

  /**
   * Performs a POST request to the specified API endpoint.
   *
   * @param endpoint - The key of the API endpoint to request.
   * @param body - The body of the request.
   * @returns An Observable containing the response data of type T.
   */
  post<T, B>(endpoint: keyof ApiEndpoints, body?: B): Observable<T> {
    return this.http.post<T>(this._buildUrl(endpoint), body).pipe(catchError(this._handleError));
  }

  /**
   * Patches a single item of type T at the specified API endpoint.
   *
   * @param endpoint - The key of the API endpoint to request.
   * @param id - The ID of the item to patch.
   * @param body - The body of the request.
   * @returns An Observable containing the patched item.
   */
  patch<T, B>(endpoint: keyof ApiEndpoints, id: string | number, body: B): Observable<T> {
    return this.http
      .patch<T>(this._buildUrl(endpoint, id), body)
      .pipe(catchError(this._handleError));
  }

  /**
   * Deletes a single item of type T from the specified API endpoint.
   *
   * @param endpoint - The key of the API endpoint to request.
   * @param id - The ID of the item to delete.
   * @returns An Observable containing the deleted item.
   */
  delete<T>(endpoint: keyof ApiEndpoints, id: string | number): Observable<T> {
    return this.http.delete<T>(this._buildUrl(endpoint, id)).pipe(catchError(this._handleError));
  }
}
