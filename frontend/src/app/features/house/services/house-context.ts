import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HouseContextService {
  private readonly _houseChanged = new Subject<number>();
  readonly selectedHouseChanged$ = this._houseChanged.asObservable();

  // Optional sync cache
  readonly currentSelectedHouseId = signal<number | null>(null);

  notifySelectedHouseChange(id: number) {
    this.currentSelectedHouseId.set(id);
    this._houseChanged.next(id);
  }
}
