import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { UserHouse } from '@features/house/models';
import { ProfileService } from '@features/user';
import { IconComponent } from '@ui/index';
@Component({
  selector: 'hia-house-card',
  imports: [IconComponent],
  templateUrl: './house-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseCardComponent {
  private readonly _profileService = inject(ProfileService);

  readonly house = input<UserHouse>();
  readonly houseChange = output<number>();

  selectedHouseId = computed(() => this._profileService.getProfile()?.selectedHouseId);
  isSelected = computed(() => {
    const house = this.house();
    if (!house) return false;
    return this.selectedHouseId() === house.id;
  });

  itemCount = computed(() => this.house()?.items?.length || 0);
  roomCount = computed(() => this.house()?.rooms?.length || 0);

  switchHouse(id: number | undefined) {
    if (!id || this.selectedHouseId() === id) return;
    this.houseChange.emit(id);
  }
}
