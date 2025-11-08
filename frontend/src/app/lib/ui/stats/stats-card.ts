import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { mergeClasses } from '@lib/utils';
import type { ClassValue } from 'clsx';
import { ZardCardComponent } from '../card';
import { IconComponent } from '../icon';
import { IconName } from '@core/config';

@Component({
  selector: 'hia-stats-card',
  standalone: true,
  imports: [ZardCardComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <z-card
      [class]="cardClasses()"
      class="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      <!-- Decorative Corner Accent -->
      <div
        class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10"
        aria-hidden="true"
      ></div>

      <div class="flex items-start justify-between space-y-0 pb-2">
        <h3 class="text-sm font-medium tracking-tight">{{ title() }}</h3>
        <div [class]="iconContainerClasses()">
          <hia-icon [name]="icon()" class="h-4 w-4" />
        </div>
      </div>
      <div class="space-y-2">
        <div class="text-3xl font-semibold tracking-tight">{{ value() }}</div>
        @if (change()) {
        <div class="flex items-center gap-2">
          <span [class]="trendBadgeClasses()">
            <hia-icon
              [name]="
                trend() === 'up' ? 'TrendingUp' : trend() === 'down' ? 'TrendingDown' : 'Minus'
              "
              [size]="14"
              class="opacity-90"
            />
            {{ change() }}
          </span>
          @if (changeLabel()) {
          <span class="text-xs text-muted-foreground">{{ changeLabel() }}</span>
          }
        </div>
        }
      </div>
    </z-card>
  `,
})
export class StatsCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<IconName>();
  readonly change = input<string>();
  readonly changeLabel = input<string>('from last month');
  readonly trend = input<'up' | 'down' | 'neutral'>('neutral');
  readonly class = input<ClassValue>('');

  readonly cardClasses = computed(() => mergeClasses('p-6', this.class()));

  readonly trendIconColors = computed(() => {
    const trend = this.trend();
    const trendColorMap: Record<string, string> = {
      up: 'green',
      down: 'red',
      neutral: 'gray',
    };
    return trendColorMap[trend];
  });

  readonly iconContainerClasses = computed(() => {
    const base = 'inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors';
    const trend = this.trend();
    const byTrend: Record<string, string> = {
      up: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      neutral: 'bg-muted text-muted-foreground',
    };
    return `${base} ${byTrend[trend]}`;
  });

  readonly trendBadgeClasses = computed(() => {
    const base = 'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full';
    const trend = this.trend();
    const byTrend: Record<string, string> = {
      up: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      neutral: 'bg-muted text-muted-foreground',
    };
    return `${base} ${byTrend[trend]}`;
  });
}
