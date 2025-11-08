import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ClassValue } from 'clsx';

import { mergeClasses, transform } from '@lib/utils';
import { IconComponent } from '../icon';
import { commonIcons } from '@core/config/icon.config';
import {
  quantityInputVariants,
  quantityInputButtonVariants,
  quantityInputFieldVariants,
  ZardQuantityInputVariants,
} from './quantity-input-variants';

@Component({
  selector: 'z-quantity-input',
  exportAs: 'zQuantityInput',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardQuantityInputComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="containerClasses()">
      <!-- Decrement Button -->
      <button
        type="button"
        [class]="decrementButtonClasses()"
        [disabled]="isDecrementDisabled()"
        (click)="decrement()"
      >
        <hia-icon [name]="commonIcons['down']" [size]="iconSize()" />
      </button>

      <!-- Input Field -->
      <input
        type="number"
        [class]="inputClasses()"
        [value]="value()"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />

      <!-- Increment Button -->
      <button
        type="button"
        [class]="incrementButtonClasses()"
        [disabled]="isIncrementDisabled()"
        (click)="increment()"
      >
        <hia-icon [name]="commonIcons['up']" [size]="iconSize()" />
      </button>
    </div>
  `,
})
export class ZardQuantityInputComponent implements ControlValueAccessor {
  readonly commonIcons = commonIcons;

  readonly zSize = input<ZardQuantityInputVariants['zSize']>('default');
  readonly zStatus = input<ZardQuantityInputVariants['zStatus']>();
  readonly class = input<ClassValue>('');

  readonly min = input<number>(0);
  readonly max = input<number>(999);
  readonly step = input<number>(1);
  readonly disabled = input(false, { transform });
  readonly readonly = input(false, { transform });
  readonly placeholder = input<string>('0');
  readonly allowEmpty = input(false, { transform });

  readonly valueChange = output<number>();
  readonly incrementEvent = output<number>();
  readonly decrementEvent = output<number>();

  private readonly _value = signal<number>(0);
  readonly value = this._value.asReadonly();

  private onChange = (value: number) => {};
  private onTouched = () => {};

  protected readonly containerClasses = computed(() =>
    mergeClasses(
      quantityInputVariants({
        zSize: this.zSize(),
        zStatus: this.zStatus(),
        zDisabled: this.disabled(),
      }),
      this.class()
    )
  );

  protected readonly decrementButtonClasses = computed(() =>
    quantityInputButtonVariants({
      zSize: this.zSize(),
      zPosition: 'left',
    })
  );

  protected readonly incrementButtonClasses = computed(() =>
    quantityInputButtonVariants({
      zSize: this.zSize(),
      zPosition: 'right',
    })
  );

  protected readonly inputClasses = computed(() =>
    quantityInputFieldVariants({
      zSize: this.zSize(),
    })
  );

  protected readonly iconSize = computed(() => {
    const size = this.zSize();
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  });

  protected readonly isDecrementDisabled = computed(() => {
    return this.disabled() || this.readonly() || this.value() <= this.min();
  });

  protected readonly isIncrementDisabled = computed(() => {
    return this.disabled() || this.readonly() || this.value() >= this.max();
  });

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const numValue = parseInt(target.value, 10);

    if (isNaN(numValue)) {
      if (this.allowEmpty()) {
        this.setValue(0);
      } else {
        target.value = this.value().toString();
      }
      return;
    }

    this.setValue(this.clampValue(numValue));
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected onFocus(): void {
    // Optional: Add focus handling logic
  }

  protected increment(): void {
    if (this.isIncrementDisabled()) return;

    const newValue = this.value() + this.step();
    const clampedValue = this.clampValue(newValue);
    this.setValue(clampedValue);
    this.incrementEvent.emit(clampedValue);
  }

  protected decrement(): void {
    if (this.isDecrementDisabled()) return;

    const newValue = this.value() - this.step();
    const clampedValue = this.clampValue(newValue);
    this.setValue(clampedValue);
    this.decrementEvent.emit(clampedValue);
  }

  private setValue(value: number): void {
    const clampedValue = this.clampValue(value);
    this._value.set(clampedValue);
    this.onChange(clampedValue);
    this.valueChange.emit(clampedValue);
  }

  private clampValue(value: number): number {
    return Math.max(this.min(), Math.min(this.max(), value));
  }

  writeValue(value: number): void {
    if (value !== null && value !== undefined) {
      this._value.set(this.clampValue(value));
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // The disabled state is handled through the disabled input
    // This method is required by ControlValueAccessor but we don't need to implement it
    // since we're using input signals for state management
  }
}
