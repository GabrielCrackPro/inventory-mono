import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZardSelectComponent, ZardSelectItemComponent } from '@ui/select';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@ui/form';

export const DEFAULT_UNITS = [
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

@Component({
  selector: 'hia-unit-selector',
  imports: [
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UnitSelectorComponent,
      multi: true,
    },
  ],
  template: `
    <z-form-field>
      <z-form-label [zRequired]="required()">{{ label() }}</z-form-label>
      <z-form-control [errorMessage]="errorMessage() || ''">
        <z-select
          [zValue]="value"
          (zSelectionChange)="onSelectionChange($event)"
          zPlaceholder="Select unit"
        >
          @for (unit of units(); track unit) {
          <z-select-item [zValue]="unit">{{ unit }}</z-select-item>
          }
        </z-select>
      </z-form-control>
    </z-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitSelectorComponent implements ControlValueAccessor {
  // Inputs
  label = input<string>('Unit');
  required = input<boolean>(true);
  errorMessage = input<string>('');
  units = input<string[]>(DEFAULT_UNITS);

  // Internal state
  value = '';
  private _onChange = (value: string) => {};
  private _onTouched = () => {};

  onSelectionChange(value: string): void {
    this.value = value;
    this._onChange(value);
    this._onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
