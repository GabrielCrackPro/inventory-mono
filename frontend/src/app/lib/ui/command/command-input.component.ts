import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ClassValue } from 'clsx';
import { commonIcons } from '@core/config/icon.config';
import { Subject, switchMap, takeUntil, timer } from 'rxjs';

import { mergeClasses } from '@lib/utils/merge-classes';
import { IconComponent } from '@ui/icon';
import { ZardCommandComponent } from './command.component';
import { commandInputVariants } from './command.variants';

@Component({
  selector: 'z-command-input',
  exportAs: 'zCommandInput',
  standalone: true,
  imports: [FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="relative flex items-center border-b px-4 py-3 group" cmdk-input-wrapper="">
      <div class="flex items-center justify-center w-5 h-5 mr-3 shrink-0">
        <hia-icon
          [name]="commonIcons['search']"
          [size]="16"
          class="text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200"
        />
      </div>
      <input
        #searchInput
        [class]="classes()"
        [placeholder]="placeholder()"
        [(ngModel)]="searchTerm"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        role="combobox"
        [attr.aria-expanded]="true"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-controls]="'command-list'"
        [attr.aria-label]="'Search commands'"
        [attr.aria-describedby]="'command-instructions'"
      />
      @if (searchTerm()) {
      <button
        type="button"
        (click)="clearSearch()"
        class="flex items-center justify-center w-5 h-5 ml-2 shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors duration-200 rounded-sm hover:bg-accent"
        aria-label="Clear search"
      >
        <hia-icon [name]="'lucideX'" [size]="14" />
      </button>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardCommandInputComponent),
      multi: true,
    },
  ],
})
export class ZardCommandInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private readonly commandComponent = inject(ZardCommandComponent, { optional: true });
  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  readonly commonIcons = commonIcons;

  readonly placeholder = input<string>('Type a command or search...');
  readonly class = input<ClassValue>('');

  @Output() readonly valueChange = new EventEmitter<string>();

  readonly searchTerm = signal('');
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  protected readonly classes = computed(() =>
    mergeClasses(
      commandInputVariants({}),
      'text-base placeholder:text-muted-foreground/50',
      this.class()
    )
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_: string) => {
    // ControlValueAccessor implementation - intentionally empty
  };
  private onTouched = () => {
    // ControlValueAccessor implementation - intentionally empty
  };

  ngOnInit(): void {
    // Set up debounced search stream - always send to subject
    this.searchSubject
      .pipe(
        switchMap((value) => {
          // If empty, emit immediately, otherwise debounce
          return value === '' ? timer(0) : timer(150);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Get the current value from the signal to ensure we have the latest
        const currentValue = this.searchTerm();
        this.updateParentComponents(currentValue);
      });
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.searchTerm.set(value);

    // Always send to subject - let the stream handle timing
    this.searchSubject.next(value);
  }

  private updateParentComponents(value: string): void {
    // Send search to appropriate parent component
    if (this.commandComponent) {
      this.commandComponent.onSearch(value);
    }
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onKeyDown(event: KeyboardEvent) {
    // Let parent command component handle navigation keys
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
      // For Escape key, don't stop propagation to allow document listener to work
      if (event.key !== 'Escape') {
        event.preventDefault(); // Prevent default input behavior
        event.stopPropagation(); // Stop the event from bubbling up
      }

      // Send to parent command component
      if (this.commandComponent) {
        this.commandComponent.onKeyDown(event);
      }
      return;
    }
    // Handle other keys as needed
  }

  writeValue(value: string): void {
    this.searchTerm.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDisabledState(_: boolean): void {
    // Implementation if needed for form control disabled state
  }

  /**
   * Clear the search input
   */
  clearSearch(): void {
    this.searchTerm.set('');
    this.searchSubject.next('');
    this.focus();
  }

  /**
   * Focus the input element
   */
  focus(): void {
    this.searchInput().nativeElement.focus();
  }

  ngOnDestroy(): void {
    // Complete subjects to clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }
}
