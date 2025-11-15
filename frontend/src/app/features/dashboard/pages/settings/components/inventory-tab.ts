import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@ui/card';
import { ZardComboboxComponent } from '@ui/combobox';
import { ZardButtonComponent } from '@ui/button';
import { commonIcons } from '@core/config/icon.config';
import { ZardInputDirective } from '@ui/input';

@Component({
  selector: 'hia-settings-inventory-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZardCardComponent, ZardComboboxComponent, ZardButtonComponent, ZardInputDirective],
  template: `
    <z-card zTitle="Inventory" zDescription="Defaults that affect items in this house.">
      <form class="space-y-4" [formGroup]="inventoryForm()" (ngSubmit)="onSubmit.emit()">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Default visibility</label>
            <z-combobox
              [options]="visibilityOptions()"
              formControlName="defaultVisibility"
              placeholder="Select default visibility"
              searchPlaceholder="Search visibility"
              emptyText="No options"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Low-stock threshold</label>
            <input
              z-input
              type="number"
              class="w-full px-3 py-2 rounded-md border bg-transparent"
              formControlName="lowStockThreshold"
              [disabled]="!isAdmin()"
              min="0"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Default room</label>
            <z-combobox
              [options]="roomOptions()"
              [searchable]="roomCount() > 4"
              formControlName="defaultRoomId"
              placeholder="Select a default room"
              searchPlaceholder="Search rooms"
              emptyText="No rooms found"
            />
          </div>
        </div>
        <div>
          <z-button
            [label]="'Save'"
            [iconName]="commonIcons['save']"
            type="submit"
            [disabled]="!isAdmin() || inventoryForm().invalid || !inventoryForm().dirty"
          />
        </div>
      </form>
    </z-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsInventoryTabComponent {
  inventoryForm = input.required<FormGroup>();
  visibilityOptions = input.required<{ label: string; value: string }[]>();
  roomOptions = input.required<{ label: string; value: string }[]>();
  roomCount = input.required<number>();
  isAdmin = input.required<boolean>();
  onSubmit = output<void>();
  readonly commonIcons = commonIcons;
}
