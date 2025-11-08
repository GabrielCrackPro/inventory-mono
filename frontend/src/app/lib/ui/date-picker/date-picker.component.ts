import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { mergeClasses } from '@lib/utils/merge-classes';
import type { ClassValue } from 'clsx';
import { ZardCalendarComponent } from '../calendar/calendar.component';
import { IconComponent } from '../icon';
import { ZardInputDirective } from '../input/input';
import { ZardPopoverDirective } from '../popover/popover.component';

@Component({
  selector: 'z-date-picker',
  exportAs: 'zDatePicker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZardCalendarComponent, ZardPopoverDirective, ZardInputDirective, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardDatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="relative"
      zPopover
      [zContent]="calendarTemplate"
      zTrigger="click"
      zPlacement="bottom"
      [zVisible]="isOpen()"
      (zVisibleChange)="onVisibilityChange($event)"
    >
      <input
        #dateInput
        z-input
        type="text"
        [value]="displayValue()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [class]="inputClasses()"
        (keydown)="onInputKeydown($event)"
        [attr.aria-label]="placeholder()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'dialog'"
        readonly
      />
      <hia-icon
        name="lucideCalendar"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
        [size]="14"
      />
    </div>

    <ng-template #calendarTemplate>
      <div class="bg-background border rounded-lg shadow-lg p-0">
        <z-calendar
          [(value)]="value"
          [minDate]="minDate()"
          [maxDate]="maxDate()"
          [disabled]="disabled()"
          (dateChange)="onDateChange($event)"
        />
      </div>
    </ng-template>
  `,
})
export class ZardDatePickerComponent implements ControlValueAccessor {
  private readonly dateInput = viewChild.required<ElementRef<HTMLInputElement>>('dateInput');

  readonly class = input<ClassValue>('');
  readonly placeholder = input<string>('Select date...');
  readonly value = model<Date | null>(null);
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly disabled = input<boolean>(false);
  readonly dateFormat = input<string>('MM/dd/yyyy');

  readonly isOpen = signal(false);

  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  protected readonly displayValue = computed(() => {
    const date = this.value();
    if (!date) return '';

    // Format the date based on the dateFormat input
    const format = this.dateFormat();
    if (format === 'yyyy-MM-dd') {
      return date.toISOString().split('T')[0];
    }

    // Default to MM/dd/yyyy format
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  });

  protected readonly inputClasses = computed(() =>
    mergeClasses('cursor-pointer pr-10', this.class())
  );

  protected onVisibilityChange(visible: boolean): void {
    this.isOpen.set(visible);
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.disabled()) {
        this.isOpen.set(!this.isOpen());
      }
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  protected onDateChange(date: Date): void {
    this.value.set(date);
    this.onChange(date);
    this.onTouched();
    this.isOpen.set(false);
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | string | null): void {
    if (typeof value === 'string' && value) {
      // Convert string to Date
      const date = new Date(value);
      this.value.set(isNaN(date.getTime()) ? null : date);
    } else if (value instanceof Date) {
      this.value.set(value);
    } else {
      this.value.set(null);
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // The disabled state is handled through the disabled input
  }
}
