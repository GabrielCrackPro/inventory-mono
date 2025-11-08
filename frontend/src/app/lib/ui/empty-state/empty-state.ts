import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { IconName } from '@core/config';
import { mergeClasses } from '@lib/utils';
import type { ClassValue } from 'clsx';
import { ZardButtonComponent } from '../button';
import { IconComponent } from '../icon';

@Component({
  selector: 'hia-empty-state',
  standalone: true,
  imports: [IconComponent, ZardButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [class]="containerClasses()">
      <div [class]="iconContainerClasses()">
        <hia-icon [name]="icon()" [family]="iconFamily()" [class]="iconClasses()" />
      </div>

      <div class="space-y-2 text-center">
        <h3 class="font-medium text-foreground">{{ title() }}</h3>
        @if (description()) {
        <p class="text-sm text-muted-foreground max-w-sm mx-auto">{{ description() }}</p>
        }
      </div>

      @if (actionLabel()) {
      <z-button
        [zType]="actionType()"
        [zSize]="actionSize()"
        [iconName]="actionIcon()"
        [iconFamily]="iconFamily()"
        [label]="actionLabel() ?? ''"
        (click)="onAction.emit()"
        class="mt-4"
      />
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input.required<IconName>();
  readonly iconFamily = input<'lucide' | 'mat' | 'tabler' | 'mat-outline' | 'svg'>('lucide');
  readonly iconSize = input<'sm' | 'md' | 'lg'>('md');
  readonly actionLabel = input<string>();
  readonly actionIcon = input<IconName | string | undefined>();
  readonly actionType = input<'default' | 'outline' | 'ghost'>('default');
  readonly actionSize = input<'sm' | 'default' | 'lg'>('default');
  readonly class = input<ClassValue>('');

  readonly onAction = output<void>();

  protected readonly containerClasses = computed(() =>
    mergeClasses('flex flex-col items-center justify-center py-12 px-4 text-center', this.class())
  );

  protected readonly iconContainerClasses = computed(() => {
    const size = this.iconSize();
    return mergeClasses('rounded-full bg-muted/50 flex items-center justify-center mb-4', {
      'w-12 h-12': size === 'sm',
      'w-16 h-16': size === 'md',
      'w-20 h-20': size === 'lg',
    });
  });

  protected readonly iconClasses = computed(() => {
    const size = this.iconSize();
    return mergeClasses('text-muted-foreground', {
      'h-6 w-6': size === 'sm',
      'h-8 w-8': size === 'md',
      'h-10 w-10': size === 'lg',
    });
  });
}
