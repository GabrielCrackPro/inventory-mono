import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemFormService } from '@features/item/services/item-form';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@ui/form';
import { ZardInputDirective } from '@ui/input';

@Component({
  selector: 'hia-add-details-tab',
  imports: [
    ReactiveFormsModule,
    ZardCardComponent,
    IconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
  ],
  templateUrl: './add-details-tab.html',
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
export class AddDetailsTabComponent {
  itemForm = input<any>();
  private readonly formService = inject(ItemFormService);

  get form() {
    return this.formService.itemForm;
  }

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }
}
