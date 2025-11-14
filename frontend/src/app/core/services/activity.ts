import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { UserActivity } from '@shared/models';
import { ApiService } from './api';
import { HouseContextService } from '@features/house/services/house-context';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private readonly _apiService = inject(ApiService);
  private readonly _houseContext = inject(HouseContextService);

  getUserActivities(): Observable<UserActivity[]> {
    const houseId = this._houseContext.currentSelectedHouseId();

    const params = houseId ? new HttpParams().set('houseId', String(houseId)) : undefined;
    return this._apiService.get('activity', params);
  }

  getStats(): Observable<any> {
    return this._apiService.get('stats');
  }
}
