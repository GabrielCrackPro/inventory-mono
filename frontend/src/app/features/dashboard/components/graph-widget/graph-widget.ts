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

  readonly period = signal<1 | 7 | 14 | 30 | 60 | 90>(7);
  readonly metric = signal<string | number>('activities');
  readonly chartType = signal<'bar' | 'line' | 'area'>('bar');
  readonly showDataLabels = signal<boolean>(true);
  readonly showGridLines = signal<boolean>(true);
  readonly stacked = signal<boolean>(false);
  readonly animationSpeed = signal<'fast' | 'normal' | 'slow'>('normal');
  readonly loading = signal<boolean>(false);

  // Signal to track theme changes
  private readonly themeVersion = signal<number>(0);

  readonly graphViewOptions = signal<SegmentedOption[]>([
    { label: 'Activities', value: 'activities', icon: 'lucideHistory' },
    { label: 'Items', value: 'items', icon: commonIcons['item'] },
    { label: 'Both', value: 'both', icon: 'lucideBoxes' },
  ]);
  readonly graphPeriodOptions = signal<SegmentedOption[]>([
    { label: 'Today', value: 1, icon: 'lucideCalendarCheck' },
    { label: '7d', value: 7, icon: 'lucideCalendarDays' },
    { label: '14d', value: 14, icon: 'lucideCalendarDays' },
    { label: '30d', value: 30, icon: 'lucideCalendarDays' },
    { label: '60d', value: 60, icon: 'lucideCalendar' },
    { label: '90d', value: 90, icon: 'lucideCalendar' },
  ]);
  readonly chartTypeOptions = signal<SegmentedOption[]>([
    { label: 'Bar', value: 'bar', icon: 'lucideBarChart3' },
    { label: 'Line', value: 'line', icon: 'lucideLineChart' },
    { label: 'Area', value: 'area', icon: 'lucideAreaChart' },
  ]);

  readonly showOptions = signal(false);

  // Raw data sources
  private readonly activitiesData = signal<ActivityLike[]>([]);
  private readonly itemsData = signal<{ addedDate?: string | Date }[]>([]);

  // Chart configuration
  readonly labels = computed(() => this.formatLabels(this.baseDays()));
  readonly chartTypeValue = computed<'bar' | 'line'>(() => {
    const type = this.chartType();
    return (type === 'area' ? 'line' : type) as 'bar' | 'line';
  });
  // TypeScript workaround: return 'bar' type to satisfy BaseChartDirective, actual value is correct at runtime
  getChartType(): 'bar' {
    const type = this.chartType();
    return (type === 'area' ? 'line' : type) as 'bar';
  }

  // Make chart colors reactive to theme changes
  private readonly chartColors = computed(() => {
    // Include themeVersion to force recomputation when theme changes
    this.themeVersion();
    return this.getChartColors();
  });

  readonly datasets = computed<ChartDataset<any, number[]>[]>(() => {
    const metric = this.metric();
    const colors = this.chartColors(); // Use computed colors that react to theme changes
    const type = this.chartType();
    const isLine = type === 'line' || type === 'area';
    const fill = type === 'area';

    if (metric === 'both') {
      return [
        {
          label: 'Activities',
          data: this.seriesActivities().map((d) => d.value),
          backgroundColor: fill ? colors.chart1 : colors.chart1,
          borderColor: colors.chart1Border,
          borderWidth: isLine ? 2 : 2,
          borderRadius: isLine ? 0 : 8,
          hoverBackgroundColor: colors.chart1Hover,
          hoverBorderWidth: isLine ? 3 : 3,
          fill: fill,
          tension: isLine ? 0.4 : 0,
          pointRadius: isLine ? 3 : 0,
          pointHoverRadius: isLine ? 5 : 0,
        },
        {
          label: 'Items',
          data: this.seriesItems().map((d) => d.value),
          backgroundColor: fill ? colors.chart2 : colors.chart2,
          borderColor: colors.chart2Border,
          borderWidth: isLine ? 2 : 2,
          borderRadius: isLine ? 0 : 8,
          hoverBackgroundColor: colors.chart2Hover,
          hoverBorderWidth: isLine ? 3 : 3,
          fill: fill,
          tension: isLine ? 0.4 : 0,
          pointRadius: isLine ? 3 : 0,
          pointHoverRadius: isLine ? 5 : 0,
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
        borderWidth: isLine ? 2 : 2,
        borderRadius: isLine ? 0 : 8,
        hoverBackgroundColor: isActivities ? colors.chart1Hover : colors.chart2Hover,
        hoverBorderWidth: isLine ? 3 : 3,
        fill: fill,
        tension: isLine ? 0.4 : 0,
        pointRadius: isLine ? 3 : 0,
        pointHoverRadius: isLine ? 5 : 0,
      },
    ];
  });

  readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const baseOptions = this.chartService.barOptions({ showLegend: this.metric() === 'both' });
    const tooltipBg = this.getTooltipBackground();
    const animSpeed = this.animationSpeed();
    const animDuration = animSpeed === 'fast' ? 400 : animSpeed === 'slow' ? 1200 : 750;

    return {
      ...baseOptions,
      animation: {
        duration: animDuration,
        easing: 'easeInOutQuart',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        ...baseOptions?.plugins,
        legend: {
          display: this.metric() === 'both',
          position: 'top' as const,
        },
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
        datalabels: {
          ...baseOptions?.plugins?.datalabels,
          display: this.showDataLabels(),
        },
      },
      scales: {
        x: {
          stacked: this.stacked() && this.metric() === 'both',
          grid: { display: false },
          ticks: baseOptions?.scales?.['x']?.ticks,
        },
        y: {
          stacked: this.stacked() && this.metric() === 'both',
          beginAtZero: true,
          grid: {
            display: this.showGridLines(),
            color: baseOptions?.scales?.['y']?.grid?.color,
          },
          ticks: baseOptions?.scales?.['y']?.ticks,
        },
      },
    };
  });

  constructor() {
    // Listen for theme changes
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        // Increment version to trigger recomputation
        this.themeVersion.update((v) => v + 1);
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-color-scheme', 'class', 'style'],
      });
    }

    // Load preferences from localStorage
    const hid = this.houseCtx.currentSelectedHouseId();
    if (hid) {
      try {
        const raw = localStorage.getItem(this.key(hid));
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed) {
          const p = parsed.period as 1 | 7 | 14 | 30 | 60 | 90 | undefined;
          if (p && [1, 7, 14, 30, 60, 90].includes(p)) this.period.set(p);

          const m = parsed.metric as 'activities' | 'items' | 'both' | undefined;
          if (m && ['activities', 'items', 'both'].includes(m)) this.metric.set(m);

          const ct = parsed.chartType as 'bar' | 'line' | 'area' | undefined;
          if (ct && ['bar', 'line', 'area'].includes(ct)) this.chartType.set(ct);

          if (typeof parsed.showDataLabels === 'boolean')
            this.showDataLabels.set(parsed.showDataLabels);
          if (typeof parsed.showGridLines === 'boolean')
            this.showGridLines.set(parsed.showGridLines);
          if (typeof parsed.stacked === 'boolean') this.stacked.set(parsed.stacked);

          const as = parsed.animationSpeed as 'fast' | 'normal' | 'slow' | undefined;
          if (as && ['fast', 'normal', 'slow'].includes(as)) this.animationSpeed.set(as);
        }
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
    this.period.set(p as 1 | 7 | 14 | 30 | 60 | 90);
    this.savePreferences();
  }

  setMetric(m: string | number) {
    this.metric.set(m);
    this.savePreferences();
  }

  setChartType(ct: string | number) {
    this.chartType.set(ct as 'bar' | 'line' | 'area');
    this.savePreferences();
  }

  private savePreferences() {
    const hid = this.houseCtx.currentSelectedHouseId();
    if (hid) {
      try {
        localStorage.setItem(
          this.key(hid),
          JSON.stringify({
            period: this.period(),
            metric: this.metric(),
            chartType: this.chartType(),
            showDataLabels: this.showDataLabels(),
            showGridLines: this.showGridLines(),
            stacked: this.stacked(),
            animationSpeed: this.animationSpeed(),
          })
        );
      } catch {}
    }
  }

  toggleDataLabels() {
    this.showDataLabels.update((v) => !v);
    this.savePreferences();
  }

  toggleGridLines() {
    this.showGridLines.update((v) => !v);
    this.savePreferences();
  }

  toggleStacked() {
    this.stacked.update((v) => !v);
    this.savePreferences();
  }

  setAnimationSpeed(speed: string | number) {
    this.animationSpeed.set(speed as 'fast' | 'normal' | 'slow');
    this.savePreferences();
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
    if (period === 1) {
      // Show "Today" for single day view
      return ['Today'];
    }
    if (period === 7) {
      // Show day names for 7-day view
      return days.map((d) => {
        const date = new Date(d.key);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
    }
    // Show dates for longer periods (MM/DD)
    return days.map((d) => d.label.slice(5));
  }

  // Format tooltip date
  private formatTooltipDate(label: string): string {
    const period = this.period();
    const days = this.baseDays();
    const index = this.labels().indexOf(label);
    if (index === -1 || !days[index]) return label;

    const date = new Date(days[index].key);
    if (period === 1) {
      return (
        'Today - ' +
        date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: period >= 30 ? 'numeric' : undefined,
    });
  }

  // Get chart colors from theme
  // This method is called within a computed signal to react to theme changes
  private getChartColors() {
    if (typeof window === 'undefined') {
      return this.getFallbackColors();
    }

    // Force re-computation by reading from DOM each time
    const getColor = (variable: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    // Always use theme chart colors
    const chart1 = getColor('--chart-1') || 'oklch(0.55 0.22 264)';
    const chart2 = getColor('--chart-2') || 'oklch(0.65 0.15 240)';

    return {
      chart1: this.addAlpha(chart1, 0.75),
      chart1Hover: this.addAlpha(chart1, 0.9),
      chart1Border: chart1,
      chart2: this.addAlpha(chart2, 0.75),
      chart2Hover: this.addAlpha(chart2, 0.9),
      chart2Border: chart2,
    };
  }

  // Add alpha channel to OKLCH color
  private addAlpha(color: string, alpha: number): string {
    if (!color) return `rgba(99, 102, 241, ${alpha})`;

    // If already has alpha, replace it
    if (color.includes('/')) {
      return color.replace(/\/\s*[\d.]+\s*\)/, `/ ${alpha})`);
    }

    // Add alpha to OKLCH color
    if (color.startsWith('oklch(')) {
      return color.replace(')', ` / ${alpha})`);
    }

    // Fallback for other formats
    return color;
  }

  // Fallback colors for SSR
  private getFallbackColors() {
    return {
      chart1: 'rgba(99, 102, 241, 0.75)',
      chart1Hover: 'rgba(99, 102, 241, 0.9)',
      chart1Border: 'rgb(99, 102, 241)',
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
