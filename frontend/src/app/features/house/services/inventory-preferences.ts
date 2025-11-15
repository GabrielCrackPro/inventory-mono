import { Injectable, inject } from '@angular/core';
import { HouseContextService } from './house-context';

export type InventoryPreferences = {
  defaultVisibility?: 'private' | 'shared' | 'public';
  lowStockThreshold?: number;
  defaultRoomId?: number | null;
};

@Injectable({ providedIn: 'root' })
export class InventoryPreferencesService {
  private readonly houseContext = inject(HouseContextService);

  private key(houseId: number) {
    return `house:${houseId}:inventory_prefs`;
  }

  getPreferences(houseId: number): InventoryPreferences | null {
    try {
      const raw = localStorage.getItem(this.key(houseId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as InventoryPreferences;
      return parsed ?? null;
    } catch {
      return null;
    }
  }

  getForCurrentHouse(): InventoryPreferences | null {
    const id = this.houseContext.currentSelectedHouseId();
    if (!id) return null;
    return this.getPreferences(id);
  }
}
