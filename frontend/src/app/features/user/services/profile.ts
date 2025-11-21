import { inject, Injectable, signal } from '@angular/core';
import { ActivityService, ApiService, StorageService } from '@core/services';
import { AuthUser } from '@shared/models';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly _storageService = inject(StorageService);
  private readonly _activityService = inject(ActivityService);
  private readonly _apiService = inject(ApiService);

  // Signal to track profile changes reactively
  private readonly _profileSignal = signal<AuthUser | null>(this._loadProfileFromStorage());

  private _loadProfileFromStorage(): AuthUser | null {
    const p = this._storageService.getItem<AuthUser>('profile');
    if (!p) return p;
    if (typeof (p as any).emailVerified === 'undefined') {
      const normalized = { ...p, emailVerified: false } as AuthUser;
      this._storageService.setItem('profile', normalized);
      return normalized;
    }
    return p;
  }

  getProfile() {
    return this._profileSignal();
  }

  getActivities() {
    return this._activityService.getUserActivities();
  }

  getStats() {
    const defaults = { items: 0, rooms: 0, categories: 0, lowStockItems: 0 } as any;
    const p = this.getProfile();
    if (!p || !p.stats) return defaults;
    return { ...defaults, ...p.stats };
  }

  updateProfile(profile: Partial<AuthUser>) {
    const current = this.getProfile();
    const merged = { ...(current ?? {}), ...profile } as AuthUser;
    this._storageService.setItem('profile', merged);
    this._profileSignal.set(merged);
  }

  savePreferences(prefs: Record<string, any>) {
    const current = this.getProfile();
    if (!current) return undefined as any;
    const merged = { ...(current.preferences ?? {}), ...prefs } as Record<string, any>;
    return this._apiService
      .patch<AuthUser, { preferences: Record<string, any> }>('users', current.id as any, {
        preferences: merged,
      })
      .pipe(
        tap(() => {
          const nextProfile = { ...current, preferences: merged } as any;
          this._storageService.setItem('profile', nextProfile);
          this._profileSignal.set(nextProfile);
        })
      );
  }

  updateStats(newStats: AuthUser['stats']) {
    this.updateProfile({
      ...this.getProfile(),
      stats: newStats,
    });
  }

  /**
   * Fetches the latest profile from the API and persists it to storage.
   */
  refreshProfileFromServer() {
    const current = this.getProfile();
    if (!current) return undefined as any;
    return this._apiService.getOne<AuthUser>('users', current.id).pipe(
      tap((fresh) => {
        this._storageService.setItem('profile', fresh);
        this._profileSignal.set(fresh);
      })
    );
  }

  clearProfile() {
    this._storageService.removeItem('profile');
    this._profileSignal.set(null);
  }
}
