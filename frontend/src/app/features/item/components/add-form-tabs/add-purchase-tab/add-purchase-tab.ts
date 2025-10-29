import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemFormService } from '@features/item/services/item-form';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@ui/form';
import { ZardInputDirective } from '@ui/input';
import { ZardDatePickerComponent } from '@ui/date-picker';

@Component({
  selector: 'hia-add-purchase-tab',
  imports: [
    ReactiveFormsModule,
    ZardCardComponent,
    IconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardDatePickerComponent,
  ],
  templateUrl: './add-purchase-tab.html',
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
export class AddPurchaseTabComponent {
  itemForm = input<any>();
  private readonly formService = inject(ItemFormService);

  get form() {
    return this.formService.itemForm;
  }

  // Date constraints: can't select future dates, and reasonable past limit (50 years ago)
  readonly maxDate = new Date(); // Today
  readonly minDate = new Date(new Date().getFullYear() - 50, 0, 1); // 50 years ago

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }
}
