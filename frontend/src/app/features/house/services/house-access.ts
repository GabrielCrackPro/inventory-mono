import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { UserRole } from '@inventory/shared';

export type HouseAccessEntry = {
  userId: number;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
  user: { id: number; name: string; email: string };
};

export type ShareHouseBody = { userId: number; permission: 'VIEW' | 'EDIT' | 'ADMIN' };
export type InviteHouseBody = { email: string; permission: 'VIEW' | 'EDIT' | 'ADMIN' };

@Injectable({ providedIn: 'root' })
export class HouseAccessService {
  private readonly api = inject(ApiService);

  list(houseId: number) {
    return this.api.get<HouseAccessEntry[]>('houses', undefined, `${houseId}/access`);
  }

  share(houseId: number, body: ShareHouseBody) {
    return this.api.postTo<void, ShareHouseBody>('houses', `${houseId}/share`, body);
  }

  upsert(houseId: number, body: ShareHouseBody) {
    // share endpoint is an upsert in backend
    return this.api.postTo<void, ShareHouseBody>('houses', `${houseId}/share`, body);
  }

  revoke(houseId: number, userId: number) {
    return this.api.deletePath<void>('houses', `${houseId}/access/${userId}`);
  }

  invite(houseId: number, body: InviteHouseBody) {
    return this.api.postTo<void, InviteHouseBody>('houses', `${houseId}/invite`, body);
  }
}
