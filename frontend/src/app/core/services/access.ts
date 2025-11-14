import { inject, Injectable } from '@angular/core';
import { ApiService } from './api';

export type EffectiveAccess = {
  level: 'VIEW' | 'EDIT' | 'ADMIN' | null;
  canRead: boolean;
  canEdit: boolean;
  canAdmin: boolean;
};

@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly api = inject(ApiService);

  getHouseAccess(id: number) {
    return this.api.get<EffectiveAccess>('access', undefined, `house/${id}`);
  }

  getRoomAccess(id: number) {
    return this.api.get<EffectiveAccess>('access', undefined, `room/${id}`);
  }

  getItemAccess(id: number) {
    return this.api.get<EffectiveAccess>('access', undefined, `item/${id}`);
  }
}
