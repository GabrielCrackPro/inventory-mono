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
      class="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20"
    >
      <!-- Background gradient -->
      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      ></div>

      <div class="relative flex items-start justify-between gap-4">
        <div class="flex-1 space-y-3">
          <p class="text-sm font-medium text-muted-foreground">{{ title() }}</p>
          <div class="space-y-1">
            <p class="text-3xl font-bold tracking-tight">{{ value() }}</p>
            @if (change()) {
            <div class="flex items-center gap-1.5">
              <span [class]="trendBadgeClasses()">
                <hia-icon
                  [name]="
                    trend() === 'up'
                      ? 'lucideTrendingUp'
                      : trend() === 'down'
                      ? 'lucideTrendingDown'
                      : 'lucideMinus'
                  "
                  [size]="12"
                />
                {{ change() }}
              </span>
              @if (changeLabel()) {
              <span class="text-xs text-muted-foreground/70">{{ changeLabel() }}</span>
              }
            </div>
            }
          </div>
        </div>
        <div [class]="iconContainerClasses()">
          <hia-icon
            [name]="icon()"
            [size]="20"
            class="transition-transform group-hover:scale-110 duration-300"
          />
        </div>
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
    const base =
      'flex items-center justify-center h-12 w-12 rounded-xl transition-all duration-300';
    const trend = this.trend();
    const byTrend: Record<string, string> = {
      up: '[background:color-mix(in_srgb,var(--chart-2)_12%,transparent)] [color:var(--chart-2)] group-hover:[background:color-mix(in_srgb,var(--chart-2)_18%,transparent)]',
      down: '[background:color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive group-hover:[background:color-mix(in_srgb,var(--destructive)_18%,transparent)]',
      neutral: 'bg-primary/8 text-primary group-hover:bg-primary/12',
    };
    return `${base} ${byTrend[trend]}`;
  });

  readonly trendBadgeClasses = computed(() => {
    const base = 'inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md';
    const trend = this.trend();
    const byTrend: Record<string, string> = {
      up: '[background:color-mix(in_srgb,var(--chart-2)_12%,transparent)] [color:var(--chart-2)]',
      down: '[background:color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive',
      neutral: 'bg-muted text-muted-foreground',
    };
    return `${base} ${byTrend[trend]}`;
  });
}
