import { inject, Injectable } from '@angular/core';
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

  getProfile() {
    return this._storageService.getItem<AuthUser>('profile');
  }

  getActivities() {
    return this._activityService.getUserActivities();
  }

  getStats() {
    return this.getProfile()!.stats;
  }

  updateProfile(profile: Partial<AuthUser>) {
    this._storageService.setItem('profile', profile);
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
        })
      );
  }

  updateStats(newStats: AuthUser['stats']) {
    this.updateProfile({
      ...this.getProfile(),
      stats: newStats,
    });
  }

  clearProfile() {
    this._storageService.removeItem('profile');
  }
}
