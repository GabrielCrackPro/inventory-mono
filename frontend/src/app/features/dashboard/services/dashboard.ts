import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, catchError, of } from 'rxjs';
import { ItemService, LowStockItem, RecentItem } from '@features/item';
import { ProfileService } from '@features/user';
import { UserActivity } from '@shared/models';

export interface DashboardData {
  activities: UserActivity[];
  recentItems: RecentItem[];
  lowStockItems: LowStockItem[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly _profileService = inject(ProfileService);
  private readonly _itemsService = inject(ItemService);

  loadDashboardData(): Observable<DashboardData> {
    return forkJoin({
      activities: this._profileService.getActivities().pipe(
        catchError((error) => {
          console.error('Failed to load activities:', error);
          return of([]);
        })
      ),
      recentItems: this._itemsService.getRecent().pipe(
        catchError((error) => {
          console.error('Failed to load recent items:', error);
          return of([]);
        })
      ),
      lowStockItems: this._itemsService.getLowStock().pipe(
        catchError((error) => {
          console.error('Failed to load low stock items:', error);
          return of([]);
        })
      ),
    });
  }
}
