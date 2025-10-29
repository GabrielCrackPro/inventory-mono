import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserActivity } from '@shared/models';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private readonly _apiService = inject(ApiService);

  getUserActivities(): Observable<UserActivity[]> {
    return this._apiService.get('activity');
  }

  getStats(): Observable<any> {
    return this._apiService.get('stats');
  }
}
