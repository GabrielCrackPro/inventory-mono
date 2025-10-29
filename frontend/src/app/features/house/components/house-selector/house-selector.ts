import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { UserHouse } from '@features/house/models';
import { HouseService } from '@features/house/services';
import { ZardDialogRef } from '@ui/dialog';

import { IconComponent } from '@ui/icon';
import { HouseCardComponent } from '../house-card';
@Component({
  selector: 'hia-house-selector',
  imports: [HouseCardComponent, IconComponent],
  templateUrl: './house-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseSelectorComponent implements OnInit {
  private readonly _houseService = inject(HouseService);
  private readonly _dialogRef = inject(ZardDialogRef) as ZardDialogRef<
    HouseSelectorComponent,
    UserHouse
  >;

  houses = signal<UserHouse[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loading.set(true);
    this._houseService.getUserHouses().subscribe((data) => {
      this.houses.set(data);
      this.loading.set(false);
    });
  }

  selectHouse(id: number | undefined) {
    if (!id) return;

    const found = this.houses().find((h) => h.id === id);
    if (found) {
      this._dialogRef.close(found);
    }
  }
}
