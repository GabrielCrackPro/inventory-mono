import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { ItemFormService } from '@features/item/services/item-form';
import { IconName } from '@core/config';

@Component({
  selector: 'hia-form-tab-base',
  imports: [ReactiveFormsModule, ZardCardComponent, IconComponent],
  template: `
    <div [formGroup]="form">
      <z-card class="space-y-6" [@slideInUp]>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <hia-icon [name]="icon()" class="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold">{{ title() }}</h3>
            <p class="text-sm text-muted-foreground">{{ description() }}</p>
          </div>
        </div>

        <ng-content />
      </z-card>
    </div>
  `,
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
export class FormTabBaseComponent {
  private readonly formService = inject(ItemFormService);

  // Inputs
  title = input.required<string>();
  description = input.required<string>();
  icon = input.required<IconName>();

  get form() {
    return this.formService.itemForm;
  }

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }
}
