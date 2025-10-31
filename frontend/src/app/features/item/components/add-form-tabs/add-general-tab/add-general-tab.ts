import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemFormService } from '@features/item/services/item-form';
import { capitalizeFirstLetter } from '@lib/utils';
import { ZardCardComponent } from '@ui/card';
import { ZardComboboxComponent } from '@ui/combobox';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@ui/form';
import { IconComponent } from '@ui/icon';
import { ZardInputDirective } from '@ui/input';

@Component({
  selector: 'hia-add-general-tab',
  imports: [
    ReactiveFormsModule,
    ZardCardComponent,
    IconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardComboboxComponent,
  ],
  templateUrl: './add-general-tab.html',
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
export class AddGeneralTabComponent {
  itemForm = input<any>();
  private readonly formService = inject(ItemFormService);

  get form() {
    return this.formService.itemForm;
  }

  categories = [
    'electronics',
    'furniture',
    'kitchen',
    'clothing',
    'books',
    'tools',
    'sports',
    'health',
    'cleaning',
    'food',
    'other',
  ].map((c) => ({ label: capitalizeFirstLetter(c), value: c }));

  conditions = ['NEW', 'USED', 'DAMAGED'].map((c) => ({
    label: capitalizeFirstLetter(c.toLowerCase()),
    value: c,
  }));

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }
}
