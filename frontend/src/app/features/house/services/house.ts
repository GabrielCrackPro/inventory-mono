import { inject, Injectable } from '@angular/core';
import { UserHouse } from '../models';
import { ProfileService } from '@features/user';
import { ApiService } from '@core/services';
import { Observable, of } from 'rxjs';
import { HouseContextService } from './house-context';

@Injectable({
  providedIn: 'root',
})
export class HouseService {
  private readonly _apiService = inject(ApiService);
  private readonly _profileService = inject(ProfileService);
  private readonly _houseContext = inject(HouseContextService);

  getUserHouses() {
    return this._apiService.get<UserHouse[]>('houses');
  }

  getSelectedHouse() {
    const houseId = this._houseContext.currentSelectedHouseId() ?? this._profileService.getProfile()?.selectedHouseId;
    if (!houseId) return null;

    return this._apiService.getOne<UserHouse>('houses', houseId);
  }

  getActiveHouseRooms(): Observable<any> {
    const houseId = this._houseContext.currentSelectedHouseId() ?? this._profileService.getProfile()?.selectedHouseId;
    if (!houseId) return of([]);

    return this._apiService.get('activeHouseRooms', undefined, houseId);
  }

  createHouse(body: { name: string; address?: string; ownerId?: number }): Observable<UserHouse> {
    return this._apiService.post<UserHouse, typeof body>('houses', {
      ...body,
      ownerId: this._profileService.getProfile()?.id || 1,
    });
  }

  deleteHouse(id: number) {
    return this._apiService.delete<void>('houses', id);
  }
}
