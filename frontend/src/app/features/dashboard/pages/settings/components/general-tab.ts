import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@ui/card';
import { ZardButtonComponent } from '@ui/button';
import { ZardInputDirective } from '@ui/input';
import { commonIcons } from '@core/config/icon.config';

@Component({
  selector: 'hia-settings-general-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZardCardComponent, ZardButtonComponent, ZardInputDirective],
  template: `
    <z-card zTitle="General" zDescription="Basic workspace settings.">
      <form class="space-y-4" [formGroup]="generalForm()" (ngSubmit)="onSubmit.emit()">
        <div>
          <label class="block text-sm font-medium mb-1">House name</label>
          <input
            z-input
            class="w-full px-3 py-2 rounded-md border bg-transparent"
            formControlName="name"
            [disabled]="!isAdmin() || isSavingGeneral()"
            placeholder="e.g. Smith Family House"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Address</label>
          <input
            z-input
            class="w-full px-3 py-2 rounded-md border bg-transparent"
            formControlName="address"
            [disabled]="!isAdmin() || isSavingGeneral()"
            placeholder="Optional"
          />
        </div>
        <div class="flex items-center gap-3">
          <z-button
            [label]="'Save'"
            [iconName]="commonIcons['save']"
            type="submit"
            [disabled]="!isAdmin() || isSavingGeneral() || generalForm().invalid || !generalForm().dirty"
          />
          <span class="text-xs text-muted-foreground" *ngIf="!isAdmin()">
            Only admins can update house settings.
          </span>
        </div>
      </form>
    </z-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsGeneralTabComponent {
  generalForm = input.required<FormGroup>();
  isAdmin = input.required<boolean>();
  isSavingGeneral = input.required<boolean>();
  onSubmit = output<void>();
  readonly commonIcons = commonIcons;
}
