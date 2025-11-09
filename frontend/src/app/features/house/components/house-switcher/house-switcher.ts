import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { commonIcons } from '@core/config/icon.config';
import { UserHouse } from '@features/house/models';
import { HouseService } from '@features/house/services';
import { IconComponent } from '@ui/icon';
import { HouseContextService } from '@features/house/services/house-context';

@Component({
  selector: 'hia-house-switcher',
  imports: [IconComponent],
  templateUrl: './house-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseSwitcherComponent implements OnInit {
  private readonly _houseService = inject(HouseService);
  private readonly _houseContext = inject(HouseContextService);

  readonly commonIcons = commonIcons;

  onClick = output<void>();

  selectedHouse = signal<UserHouse | null>(null);
  isLoading = signal<boolean>(false);

  houseName = computed(() => this.selectedHouse()?.name || 'Select House');
  itemCount = computed(() => this.selectedHouse()?.items?.length || 0);
  roomCount = computed(() => this.selectedHouse()?.rooms?.length || 0);
  hasHouse = computed(() => !!this.selectedHouse());

  ngOnInit(): void {
    this.isLoading.set(true);
    const selected$ = this._houseService.getSelectedHouse();
    if (selected$) {
      selected$.subscribe({
        next: (data) => {
          this.selectedHouse.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      this.selectedHouse.set(null);
      this.isLoading.set(false);
    }

    // Refresh selected house when context changes
    this._houseContext.selectedHouseChanged$.subscribe(() => {
      this.isLoading.set(true);
      const refreshed$ = this._houseService.getSelectedHouse();
      if (refreshed$) {
        refreshed$.subscribe({
          next: (data) => {
            this.selectedHouse.set(data);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          },
        });
      } else {
        this.selectedHouse.set(null);
        this.isLoading.set(false);
      }
    });
  }

  onOpenHouseDialog() {
    this.onClick.emit();
  }
}
