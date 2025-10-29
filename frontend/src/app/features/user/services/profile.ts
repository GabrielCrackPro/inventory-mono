import { inject, Injectable } from '@angular/core';
import { ActivityService, StorageService } from '@core/services';
import { AuthUser } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly _storageService = inject(StorageService);
  private readonly _activityService = inject(ActivityService);

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
