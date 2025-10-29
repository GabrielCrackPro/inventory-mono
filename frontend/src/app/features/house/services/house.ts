import { inject, Injectable } from '@angular/core';
import { UserHouse } from '../models';
import { ProfileService } from '@features/user';
import { ApiService } from '@core/services';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HouseService {
  private readonly _apiService = inject(ApiService);
  private readonly _profileService = inject(ProfileService);

  getUserHouses() {
    return this._apiService.get<UserHouse[]>('houses');
  }

  getSelectedHouse() {
    const houseId = this._profileService.getProfile()?.selectedHouseId;
    if (!houseId) return null;

    return this._apiService.getOne<UserHouse>('houses', houseId);
  }

  getActiveHouseRooms(): Observable<any> {
    const houseId = this._profileService.getProfile()?.selectedHouseId;
    if (!houseId) return of([]);

    return this._apiService.get('activeHouseRooms', undefined, houseId);
  }
}
