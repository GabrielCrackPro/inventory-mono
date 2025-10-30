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
    <z-card [class]="cardClasses()">
      <div class="flex items-center justify-between space-y-0 pb-2">
        <h3 class="text-sm font-medium tracking-tight">{{ title() }}</h3>
        <hia-icon [name]="icon()" class="h-6 w-6" />
      </div>
      <div class="space-y-1">
        <div class="text-2xl font-bold">{{ value() }}</div>
        @if (change()) {
        <p class="text-xs text-muted-foreground flex items-center gap-1">
          <hia-icon
            [name]="trend() === 'up' ? 'TrendingUp' : trend() === 'down' ? 'TrendingDown' : 'Minus'"
            [color]="trendIconColors()"
            [size]="14"
          />
          {{ change() }}
          @if (changeLabel()) {
          <span>{{ changeLabel() }}</span>
          }
        </p>
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
      down: 'var("destructive")',
      neutral: 'var("muted")',
    };

    return trendColorMap[trend];
  });
}
