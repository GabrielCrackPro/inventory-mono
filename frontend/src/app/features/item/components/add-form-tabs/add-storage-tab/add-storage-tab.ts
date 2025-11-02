import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';

import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@ui/form';
import { ZardInputDirective } from '@ui/input';
import { ItemFormService } from '@features/item/services/item-form';
import { HouseService } from '@features/house';
import { HouseContextService } from '@features/house/services/house-context';
import { ZardComboboxComponent } from '@ui/combobox';
import { capitalizeFirstLetter } from '@lib/utils';

@Component({
  selector: 'hia-add-storage-tab',
  imports: [
    ReactiveFormsModule,
    ZardCardComponent,
    IconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardComboboxComponent,
    ZardInputDirective,
  ],
  templateUrl: './add-storage-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class AddStorageTabComponent implements OnInit {
  SEARCHABLE_ROOMS_LIMIT = 4;

  itemForm = input<any>();
  private readonly formService = inject(ItemFormService);
  private readonly _houseService = inject(HouseService);
  private readonly _houseContext = inject(HouseContextService);

  private _rooms = signal<any[]>([]);

  ngOnInit(): void {
    this.loadRooms();
    this._houseContext.selectedHouseChanged$.subscribe(() => {
      this.loadRooms();
    });
  }

  private loadRooms() {
    this._houseService.getActiveHouseRooms().subscribe((rooms) => this._rooms.set(rooms));
  }

  get form() {
    return this.formService.itemForm;
  }

  rooms = computed(() =>
    this._rooms().map((r) => {
      return {
        label: r.name,
        value: r.id,
      };
    })
  );

  units = [
    'unit',
    'pieces',
    'kg',
    'g',
    'lbs',
    'oz',
    'liters',
    'ml',
    'gallons',
    'meters',
    'cm',
    'inches',
    'feet',
    'boxes',
    'bottles',
    'cans',
  ].map((u) => ({ label: capitalizeFirstLetter(u), value: u }));

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }

  getFormErrors(): string[] {
    return this.formService.getFormErrors();
  }

  hasFormErrors(): boolean {
    return this.formService.hasFormErrors();
  }
}
