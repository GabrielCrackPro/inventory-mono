import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { commonIcons } from '@core/config/icon.config';
import { UserHouse } from '@features/house/models';
import { ProfileService } from '@features/user';
import { IconComponent, ZardButtonComponent } from '@ui/index';
@Component({
  selector: 'hia-house-card',
  imports: [IconComponent, ZardButtonComponent, NgClass],
  templateUrl: './house-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseCardComponent {
  private readonly _profileService = inject(ProfileService);
  
  readonly commonIcons = commonIcons;

  readonly house = input<UserHouse>();
  readonly houseChange = output<number>();
  readonly houseDelete = output<number>();

  selectedHouseId = computed(() => this._profileService.getProfile()?.selectedHouseId);
  isSelected = computed(() => {
    const house = this.house();
    if (!house) return false;
    return this.selectedHouseId() === house.id;
  });

  isOwner = computed(() => {
    const h = this.house();
    const uid = this._profileService.getProfile()?.id;
    if (!h || uid == null) return false;
    return (h as any).ownerId === uid;
  });

  itemCount = computed(() => this.house()?.items?.length || 0);
  roomCount = computed(() => this.house()?.rooms?.length || 0);

  switchHouse(id: number | undefined) {
    if (!id || this.selectedHouseId() === id) return;
    this.houseChange.emit(id);
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    const id = this.house()?.id;
    if (id) this.houseDelete.emit(id);
  }
}
