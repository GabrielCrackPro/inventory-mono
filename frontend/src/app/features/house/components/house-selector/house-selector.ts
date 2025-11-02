import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { UserHouse } from '@features/house/models';
import { HouseService } from '@features/house/services';
import { ZardButtonComponent } from '@ui/button';
import { ZardDialogRef } from '@ui/dialog';
import { HouseCardComponent } from '../house-card';
import { HouseSelectorAddComponent } from './house-selector-add';
import { A11yModule } from '@angular/cdk/a11y';
import { ProfileService } from '@features/user';
import { HouseContextService } from '@features/house/services/house-context';
import { AlertDialogService } from '@shared/services';
@Component({
  selector: 'hia-house-selector',
  imports: [HouseCardComponent, ZardButtonComponent, HouseSelectorAddComponent, A11yModule],
  templateUrl: './house-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseSelectorComponent implements OnInit {
  private readonly _houseService = inject(HouseService);
  private readonly _profileService = inject(ProfileService);
  private readonly _houseContext = inject(HouseContextService);
  private readonly _alertDialogService = inject(AlertDialogService);
  private readonly _dialogRef = inject(ZardDialogRef) as ZardDialogRef<
    HouseSelectorComponent,
    UserHouse
  >;

  houses = signal<UserHouse[]>([]);
  loading = signal<boolean>(true);
  dialogMode = signal<'add' | 'select'>('select');
  dialogTitle = signal<string>('Select House');
  dialogDescription = signal<string>("Choose which house you'd like to manage");

  ngOnInit(): void {
    this.loading.set(true);
    this._houseService.getUserHouses().subscribe((data) => {
      this.houses.set(data);
      this.loading.set(false);
    });
  }

  get addMode() {
    return this.dialogMode() === 'add';
  }

  get selectMode() {
    return this.dialogMode() === 'select';
  }

  selectHouse(id: number | undefined) {
    if (!id) return;

    const found = this.houses().find((h) => h.id === id);
    if (found) {
      const current = this._profileService.getProfile();
      this._profileService.updateProfile({ ...(current as any), selectedHouseId: found.id });
      this._houseContext.notifySelectedHouseChange(found.id);
      this._dialogRef.close(found);
    }
  }

  addHouse() {
    this.dialogTitle.set('Add House');
    this.dialogDescription.set('Add a new house to your account');
    this.dialogMode.set('add');
  }

  deleteHouse(id: number) {
    if (!id) return;
    this._alertDialogService.confirm({
      zTitle: 'Delete House',
      zContent: 'Are you sure you want to delete this house? This action cannot be undone.',
      zType: 'destructive',
      zOkDestructive: true,
      zOkText: 'Delete',
      zIcon: 'Trash',
      zCancelText: 'Cancel',
      zOnOk: () => {
        this._houseService.deleteHouse(id).subscribe(() => {
          // remove from local list
          this.houses.update((list) => list.filter((h) => h.id !== id));
          // if deleted house was selected, clear selection in profile
          const current = this._profileService.getProfile() as any;
          if (current?.selectedHouseId === id) {
            this._profileService.updateProfile({ ...current, selectedHouseId: undefined });
          }
        });
      },
    });
  }
}
