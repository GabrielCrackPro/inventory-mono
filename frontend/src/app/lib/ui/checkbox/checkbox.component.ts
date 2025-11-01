import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ClassValue } from 'clsx';

import { checkboxLabelVariants, checkboxVariants, ZardCheckboxVariants } from './checkbox.variants';
import { mergeClasses, transform } from '@lib/utils/merge-classes';
import { IconComponent } from '@ui/icon';
import { computed as ngComputed } from '@angular/core';

type OnTouchedType = () => any;
type OnChangeType = (value: any) => void;

@Component({
  selector: 'z-checkbox, [z-checkbox]',
  standalone: true,
  imports: [IconComponent],
  exportAs: 'zCheckbox',
  template: `
    <span
      tabindex="0"
      class="flex items-center gap-2"
      [class]="disabled() ? 'cursor-not-allowed' : 'cursor-pointer'"
      role="checkbox"
      [attr.aria-checked]="ariaChecked()"
      [attr.aria-disabled]="disabled() ? 'true' : 'false'"
      (click)="onCheckboxChange()"
      (keyup)="onKeyboardEvent($event)"
    >
      <main class="flex relative">
        <input
          #input
          type="checkbox"
          [class]="classes()"
          [id]="inputId"
          [checked]="currentChecked()"
          [disabled]="disabled()"
          [indeterminate]="indeterminate()"
          (blur)="onCheckboxBlur()"
          name="checkbox"
        />
        <hia-icon
          name="Check"
          color="var(--primary-foreground)"
          [size]="10"
          [class]="
            'absolute flex items-center justify-center text-primary-foreground top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity ' +
            (currentChecked() && !indeterminate() ? 'opacity-100' : 'opacity-0')
          "
        />
        <hia-icon
          name="Minus"
          [size]="10"
          [class]="
            'absolute flex items-center justify-center text-primary-foreground top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity ' +
            (indeterminate() ? 'opacity-100' : 'opacity-0')
          "
        />
      </main>
      <label [class]="labelClasses()" [attr.for]="inputId">
        <ng-content></ng-content>
      </label>
    </span>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZardCheckboxComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly checkChange = output<boolean>();
  readonly class = input<ClassValue>('');
  readonly disabled = input(false, { transform });
  readonly zType = input<ZardCheckboxVariants['zType']>('default');
  readonly zSize = input<ZardCheckboxVariants['zSize']>('default');
  readonly zShape = input<ZardCheckboxVariants['zShape']>('default');
  readonly indeterminate = input(false, { transform });
  // When provided, the component becomes controlled and reflects this value instead of internal state
  readonly checkedInput = input<boolean | null>(null);
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onChange: OnChangeType = () => {};
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onTouched: OnTouchedType = () => {};

  protected readonly classes = computed(() =>
    mergeClasses(
      checkboxVariants({ zType: this.zType(), zSize: this.zSize(), zShape: this.zShape() }),
      this.class()
    )
  );
  protected readonly labelClasses = computed(() =>
    mergeClasses(checkboxLabelVariants({ zSize: this.zSize() }))
  );
  checked = false;
  private static uid = 0;
  readonly inputId = `z-checkbox-${++ZardCheckboxComponent.uid}`;

  // If checkedInput is provided, prefer that; otherwise use internal checked
  protected readonly currentChecked = ngComputed(() =>
    this.checkedInput() !== null ? (this.checkedInput() as boolean) : this.checked
  );
  protected readonly ariaChecked = ngComputed(() =>
    this.indeterminate() ? 'mixed' : this.currentChecked() ? 'true' : 'false'
  );

  writeValue(val: boolean): void {
    this.checked = val;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  onCheckboxBlur(): void {
    this.onTouched();
    this.cdr.markForCheck();
  }

  onCheckboxChange(): void {
    if (this.disabled()) return;

    const next = !this.currentChecked();
    // Only update internal state if uncontrolled
    if (this.checkedInput() === null) {
      this.checked = next;
    }
    this.onChange(next);
    this.checkChange.emit(next);
    this.cdr.markForCheck();
  }

  onKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.onCheckboxChange();
    }
  }
}
