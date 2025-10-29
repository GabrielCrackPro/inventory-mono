import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { UserHouse } from '@features/house/models';
import { HouseService } from '@features/house/services';
import { IconComponent } from '@ui/icon';

@Component({
  selector: 'hia-house-switcher',
  imports: [IconComponent],
  templateUrl: './house-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseSwitcherComponent implements OnInit {
  private readonly _houseService = inject(HouseService);

  onClick = output<void>();

  selectedHouse = signal<UserHouse | null>(null);
  isLoading = signal<boolean>(false);

  houseName = computed(() => this.selectedHouse()?.name || 'Select House');
  houseAddress = computed(() => this.selectedHouse()?.address || 'No address');
  itemCount = computed(() => this.selectedHouse()?.items?.length || 0);
  roomCount = computed(() => this.selectedHouse()?.rooms?.length || 0);
  hasHouse = computed(() => !!this.selectedHouse());

  ngOnInit(): void {
    this.isLoading.set(true);
    this._houseService.getSelectedHouse()?.subscribe({
      next: (data) => {
        this.selectedHouse.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onOpenHouseDialog() {
    this.onClick.emit();
  }
}
