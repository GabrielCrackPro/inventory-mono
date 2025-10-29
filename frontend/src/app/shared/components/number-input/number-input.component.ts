import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@ui/form';
import { ZardInputDirective } from '@ui/input';

@Component({
  selector: 'hia-number-input',
  imports: [
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NumberInputComponent,
      multi: true,
    },
  ],
  template: `
    <z-form-field [class]="fieldClass()">
      <z-form-label [zRequired]="required()">{{ label() }}</z-form-label>
      <z-form-control [errorMessage]="errorMessage() || ''" [helpText]="helpText() || ''">
        <input
          z-input
          type="number"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [placeholder]="placeholder() || ''"
        />
      </z-form-control>
    </z-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputComponent implements ControlValueAccessor {
  // Inputs
  label = input.required<string>();
  required = input<boolean>(false);
  errorMessage = input<string>('');
  helpText = input<string>('');
  placeholder = input<string>('');
  min = input<number>(0);
  max = input<number | undefined>(undefined);
  step = input<number>(1);
  fieldClass = input<string>('');

  // Internal state
  value: number | null = null;
  private _onChange = (value: number | null) => {};
  private _onTouched = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const numValue = target.value ? parseFloat(target.value) : null;
    this.value = numValue;
    this._onChange(numValue);
  }

  onBlur(): void {
    this._onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
