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

@Component({
  selector: 'hia-add-storage-tab',
  imports: [
    ReactiveFormsModule,
    ZardCardComponent,
    IconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
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
  itemForm = input<any>();
  private readonly formService = inject(ItemFormService);
  private readonly _houseService = inject(HouseService);

  private _rooms = signal<any[]>([]);

  ngOnInit(): void {
    this._houseService.getActiveHouseRooms().subscribe((rooms) => {
      this._rooms.set(rooms);
    });
  }

  get form() {
    return this.formService.itemForm;
  }

  rooms = computed(() =>
    this._rooms().map((r) => {
      return {
        name: r.name,
        value: r.name.toLowerCase().split(' ').join('-'),
      };
    })
  );

  units = [
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
  ];

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
