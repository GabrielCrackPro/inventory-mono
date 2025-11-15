import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ChartService } from '@lib/chart/chart.service';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartDataset, ChartConfiguration } from 'chart.js';
import { ZardCardComponent } from '@ui/card';
import { ZardButtonComponent } from '@ui/button';
import { HouseContextService } from '@features/house/services/house-context';
import { ProfileService } from '@features/user';
import { DashboardService } from '@features/dashboard';
import { finalize } from 'rxjs';
import { SegmentedOption, ZardSegmentedComponent } from '@ui/segmented';
import { commonIcons } from '@core/config';

interface ActivityLike {
  createdAt?: string | Date;
  date?: string | Date;
}

interface DayData {
  label: string;
  value: number;
  key: string;
}

@Component({
  selector: 'hia-graph-widget',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardSegmentedComponent,
    ZardButtonComponent,
    BaseChartDirective,
  ],
  templateUrl: './graph-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphWidgetComponent {
  private readonly profile = inject(ProfileService);
  private readonly houseCtx = inject(HouseContextService);
  private readonly dashboard = inject(DashboardService);
  private readonly chartService = inject(ChartService);

  private key(houseId: number) {
    return `house:${houseId}:graph_prefs`;
  }

  readonly period = signal<7 | 30>(7);
  readonly metric = signal<string | number>('activities');
  readonly loading = signal<boolean>(false);
  readonly graphViewOptions = signal<SegmentedOption[]>([
    { label: 'Activities', value: 'activities', icon: 'lucideHistory' },
    { label: 'Items', value: 'items', icon: commonIcons['item'] },
    { label: 'Both', value: 'both', icon: 'lucideBoxes' },
  ]);
  readonly graphPeriodOptions = signal<SegmentedOption[]>([
    { label: '7d', value: 7, icon: 'lucideCalendarDays' },
    { label: '30d', value: 30, icon: 'lucideCalendarDays' },
  ]);

  readonly showOptions = signal(false);

  // Raw data sources
  private readonly activitiesData = signal<ActivityLike[]>([]);
  private readonly itemsData = signal<{ addedDate?: string | Date }[]>([]);

  // Chart configuration
  readonly labels = computed(() => this.formatLabels(this.baseDays()));
  readonly datasets = computed<ChartDataset<'bar', number[]>[]>(() => {
    const metric = this.metric();
    const colors = this.getChartColors();

    if (metric === 'both') {
      return [
        {
          label: 'Activities',
          data: this.seriesActivities().map((d) => d.value),
          backgroundColor: colors.chart1,
          borderColor: colors.chart1Border,
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: colors.chart1Hover,
          hoverBorderWidth: 3,
        },
        {
          label: 'Items',
          data: this.seriesItems().map((d) => d.value),
          backgroundColor: colors.chart2,
          borderColor: colors.chart2Border,
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: colors.chart2Hover,
          hoverBorderWidth: 3,
        },
      ];
    }
    const single = this.series().map((d) => d.value);
    const isActivities = metric === 'activities';
    return [
      {
        label: isActivities ? 'Activities' : 'Items',
        data: single,
        backgroundColor: isActivities ? colors.chart1 : colors.chart2,
        borderColor: isActivities ? colors.chart1Border : colors.chart2Border,
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: isActivities ? colors.chart1Hover : colors.chart2Hover,
        hoverBorderWidth: 3,
      },
    ];
  });

  readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const baseOptions = this.chartService.barOptions({ showLegend: this.metric() === 'both' });
    const tooltipBg = this.getTooltipBackground();
    return {
      ...baseOptions,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        ...baseOptions?.plugins,
        tooltip: {
          ...baseOptions?.plugins?.tooltip,
          backgroundColor: tooltipBg,
          padding: 12,
          cornerRadius: 8,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          displayColors: true,
          callbacks: {
            title: (items) => {
              const item = items[0];
              return this.formatTooltipDate(item.label);
            },
          },
        },
      },
    };
  });

  constructor() {
    // preferences load handled below
    const hid = this.houseCtx.currentSelectedHouseId();
    if (hid) {
      try {
        const raw = localStorage.getItem(this.key(hid));
        const parsed = raw ? JSON.parse(raw) : null;
        const p = parsed?.period as 7 | 30 | undefined;
        if (p === 30) this.period.set(30);
        const m = parsed?.metric as 'activities' | 'items' | 'both' | undefined;
        if (m === 'items' || m === 'both') this.metric.set(m);
      } catch {}
    }

    // load data (lightweight; Home also loads but this is isolated to the widget)
    this.loading.set(true);
    this.profile
      .getActivities()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (acts: any[]) => this.activitiesData.set(acts ?? []),
        error: () => this.activitiesData.set([]),
      });

    this.dashboard.loadDashboardData().subscribe({
      next: (data: any) => {
        this.itemsData.set((data?.recentItems ?? []) as any);
      },
      error: () => this.itemsData.set([]),
    });
  }

  setPeriod(p: number | string) {
    this.period.set(p as 7 | 30);
    const hid = this.houseCtx.currentSelectedHouseId();
    if (hid) {
      try {
        localStorage.setItem(this.key(hid), JSON.stringify({ period: p, metric: this.metric() }));
      } catch {}
    }
  }

  setMetric(m: string | number) {
    this.metric.set(m);
    const hid = this.houseCtx.currentSelectedHouseId();
    if (hid) {
      try {
        localStorage.setItem(this.key(hid), JSON.stringify({ period: this.period(), metric: m }));
      } catch {}
    }
  }

  // Summary statistics
  readonly totalActivities = computed(() =>
    this.seriesActivities().reduce((sum, d) => sum + d.value, 0)
  );
  readonly totalItems = computed(() => this.seriesItems().reduce((sum, d) => sum + d.value, 0));
  readonly avgPerDay = computed(() => {
    const metric = this.metric();
    const period = this.period();
    if (metric === 'activities') {
      return (this.totalActivities() / period).toFixed(1);
    } else if (metric === 'items') {
      return (this.totalItems() / period).toFixed(1);
    }
    return ((this.totalActivities() + this.totalItems()) / period).toFixed(1);
  });
  readonly trend = computed(() => {
    const series =
      this.metric() === 'both'
        ? this.seriesActivities().map((d, i) => d.value + this.seriesItems()[i].value)
        : this.series().map((d) => d.value);

    if (series.length < 2) return 0;

    const half = Math.floor(series.length / 2);
    const firstHalf = series.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const secondHalf = series.slice(half).reduce((a, b) => a + b, 0) / (series.length - half);

    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0;
    return ((secondHalf - firstHalf) / firstHalf) * 100;
  });

  // Precompute aligned labels and series for both metrics
  private readonly baseDays = computed(() => {
    const n = this.period();
    const today = new Date();
    const days: DayData[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ label: key, value: 0, key });
    }
    return days;
  });

  private readonly seriesActivities = computed(() =>
    this.computeSeries(this.activitiesData(), (a) => a.createdAt ?? a.date)
  );

  private readonly seriesItems = computed(() =>
    this.computeSeries(
      this.itemsData(),
      (it) => it.addedDate ?? (it as any).createdAt ?? (it as any).date
    )
  );

  // For single metric view
  private readonly series = computed(() => {
    if (this.metric() === 'activities') return this.seriesActivities();
    if (this.metric() === 'items') return this.seriesItems();
    return this.baseDays().map((d) => ({ ...d }));
  });

  // Helper to compute series from data
  private computeSeries<T>(
    data: T[],
    dateExtractor: (item: T) => string | Date | undefined
  ): DayData[] {
    const days = this.baseDays().map((d) => ({ ...d }));
    data.forEach((item) => {
      const dateValue = dateExtractor(item);
      if (!dateValue) return;
      const dt = new Date(dateValue as any);
      if (isNaN(dt.getTime())) return;
      const k = dt.toISOString().slice(0, 10);
      const idx = days.findIndex((x) => x.key === k);
      if (idx >= 0) days[idx].value++;
    });
    return days;
  }

  readonly maxY = computed(() => {
    if (this.metric() !== 'both') return Math.max(0, ...this.series().map((d) => d.value));
    const a = this.seriesActivities().map((d) => d.value);
    const b = this.seriesItems().map((d) => d.value);
    return Math.max(0, ...(a.length ? a : [0]), ...(b.length ? b : [0]));
  });

  readonly hasData = computed(() => this.maxY() > 0);

  toggleOptions() {
    this.showOptions.update((v) => !v);
  }

  // Format labels for display
  private formatLabels(days: DayData[]): string[] {
    const period = this.period();
    if (period === 7) {
      // Show day names for 7-day view
      return days.map((d) => {
        const date = new Date(d.key);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
    }
    // Show dates for 30-day view (MM/DD)
    return days.map((d) => d.label.slice(5));
  }

  // Format tooltip date
  private formatTooltipDate(label: string): string {
    const period = this.period();
    const days = this.baseDays();
    const index = this.labels().indexOf(label);
    if (index === -1 || !days[index]) return label;

    const date = new Date(days[index].key);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: period === 30 ? 'numeric' : undefined,
    });
  }

  // Get chart colors with vibrant palette
  private getChartColors() {
    return {
      // Indigo - vibrant purple-blue
      chart1: 'rgba(99, 102, 241, 0.75)',
      chart1Hover: 'rgba(99, 102, 241, 0.9)',
      chart1Border: 'rgb(99, 102, 241)',
      // Emerald - vibrant green
      chart2: 'rgba(16, 185, 129, 0.75)',
      chart2Hover: 'rgba(16, 185, 129, 0.9)',
      chart2Border: 'rgb(16, 185, 129)',
    };
  }

  // Get tooltip background color from theme
  private getTooltipBackground(): string {
    if (typeof window === 'undefined') return 'rgba(0, 0, 0, 0.9)';

    const getColor = (variable: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    const popover = getColor('--popover');
    if (!popover) return 'rgba(0, 0, 0, 0.9)';

    // Add alpha to popover color
    const match = popover.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      return `oklch(${match[1]} ${match[2]} ${match[3]} / 0.95)`;
    }
    return popover;
  }
}
