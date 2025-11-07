import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemFormService } from '@features/item/services/item-form';
import { ZardCardComponent } from '@ui/card';
import { ZardCheckboxComponent } from '@ui/checkbox';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@ui/form';
import { IconComponent } from '@ui/icon';
import { ZardInputDirective } from '@ui/input';
import { ZardRadioComponent } from '@ui/radio';

@Component({
  selector: 'hia-add-sharing-tab',
  imports: [
    ReactiveFormsModule,
    ZardCardComponent,
    IconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardCheckboxComponent,
    ZardRadioComponent,
  ],
  templateUrl: './add-sharing-tab.html',
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
export class AddSharingTabComponent {
  itemForm = input<any>();
  private readonly formService = inject(ItemFormService);

  get form() {
    return this.formService.itemForm;
  }

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }
}
