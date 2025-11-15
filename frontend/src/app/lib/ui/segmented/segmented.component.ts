import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  input,
  OnInit,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { mergeClasses } from '@lib/utils/merge-classes';
import type { ClassValue } from 'clsx';
import {
  segmentedItemVariants,
  segmentedVariants,
  ZardSegmentedVariants,
} from './segmented.variants';
import { IconComponent } from '@ui/icon';
import { IconName } from '@core/config';

export interface SegmentedOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: IconName;
}
@Component({
  selector: 'z-segmented-item',
  standalone: true,
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
})
export class ZardSegmentedItemComponent {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly disabled = input(false);
}

@Component({
  selector: 'z-segmented',
  exportAs: 'zSegmented',
  imports: [IconComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [class]="classes()" role="tablist" [attr.aria-label]="zAriaLabel()">
      @if (zOptions().length > 0) { @for (option of zOptions(); track option.value) {
      <button
        type="button"
        role="tab"
        [class]="getItemClasses(option.value) + ' inline-flex items-center gap-1.5'"
        [disabled]="option.disabled || zDisabled()"
        [attr.aria-selected]="isSelected(option.value)"
        [attr.aria-controls]="option.value + '-panel'"
        [attr.id]="option.value + '-tab'"
        (click)="selectOption(option.value)"
      >
        <hia-icon [name]="option.icon" [size]="16" />
        <span>{{ option.label }}</span>
      </button>
      } } @else { @for (item of items(); track item.value()) {
      <button
        type="button"
        role="tab"
        [class]="getItemClasses(item.value()) + ' inline-flex items-center gap-1.5'"
        [disabled]="item.disabled() || zDisabled()"
        [attr.aria-selected]="isSelected(item.value())"
        [attr.aria-controls]="item.value() + '-panel'"
        [attr.id]="item.value() + '-tab'"
        (click)="selectOption(item.value())"
      >
        {{ item.label() }}
      </button>
      } }
    </div>
  `,
  host: {
    '[class]': 'wrapperClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardSegmentedComponent),
      multi: true,
    },
  ],
})
export class ZardSegmentedComponent implements ControlValueAccessor, OnInit {
  private readonly itemComponents = contentChildren(ZardSegmentedItemComponent);

  readonly class = input<ClassValue>('');
  readonly zSize = input<ZardSegmentedVariants['zSize']>('default');
  readonly zOptions = input<SegmentedOption[]>([]);
  readonly zDefaultValue = input<string | number>('');
  readonly zDisabled = input(false);
  readonly zAriaLabel = input<string>('Segmented control');

  readonly zChange = output<string | number>();

  protected readonly selectedValue = signal<string | number>('');
  protected readonly items = signal<readonly ZardSegmentedItemComponent[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string | number) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched = () => {};

  constructor() {
    effect(() => {
      this.items.set(this.itemComponents());
    });
  }

  ngOnInit() {
    // Initialize with default value
    if (this.zDefaultValue()) {
      this.selectedValue.set(this.zDefaultValue());
    }
  }

  protected readonly classes = computed(() =>
    mergeClasses(segmentedVariants({ zSize: this.zSize() }), this.class())
  );

  protected readonly wrapperClasses = computed(() => 'inline-block gap-1');

  protected getItemClasses(value: string | number): string {
    return segmentedItemVariants({
      zSize: this.zSize(),
      isActive: this.isSelected(value),
    });
  }

  protected isSelected(value: string | number): boolean {
    return this.selectedValue() === value;
  }

  protected selectOption(value: string | number) {
    if (this.zDisabled()) return;

    const option = this.zOptions().find((opt) => opt.value === value);
    const item = this.items().find((item) => item.value() === value);

    if ((option && option.disabled) || (item && item.disabled())) return;

    this.selectedValue.set(value);
    this.onChange(value);
    this.onTouched();
    this.zChange.emit(value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.selectedValue.set(value || '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Handled by zDisabled input
  }
}
