import { Injectable } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartDataset } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Injectable({ providedIn: 'root' })
export class ChartService {
  constructor() {
    try {
      Chart.register(...registerables);
      Chart.register(ChartDataLabels);
    } catch {}
  }

  // Get colors from CSS custom properties to support light/dark mode
  private getColor(variable: string): string {
    if (typeof window === 'undefined') return 'transparent';
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }

  private toRgba(oklch: string, alpha: number): string {
    // For now, return the oklch value with alpha - browsers support this
    // Format: oklch(L C H / alpha)
    if (!oklch) return 'transparent';
    const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      return `oklch(${match[1]} ${match[2]} ${match[3]} / ${alpha})`;
    }
    return oklch;
  }

  // Get tooltip background from theme
  private getTooltipBackground(): string {
    const popover = this.getColor('--popover');
    if (!popover) return 'rgba(0, 0, 0, 0.9)';

    const match = popover.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      return `oklch(${match[1]} ${match[2]} ${match[3]} / 0.95)`;
    }
    return popover;
  }

  // Get label color from theme
  private getLabelColor(): string {
    const foreground = this.getColor('--foreground');
    return foreground || '#111827';
  }

  // Shared styling defaults with vibrant colors
  private get palette() {
    return {
      // Indigo for primary chart color
      chart1: 'rgba(99, 102, 241, 0.75)',
      chart1Hover: 'rgba(99, 102, 241, 0.9)',
      chart1Border: 'rgb(99, 102, 241)',
      // Emerald for secondary chart color
      chart2: 'rgba(16, 185, 129, 0.75)',
      chart2Hover: 'rgba(16, 185, 129, 0.9)',
      chart2Border: 'rgb(16, 185, 129)',
      // Theme-based colors for UI elements
      grid: this.toRgba(this.getColor('--border'), 0.3),
      tick: this.getColor('--muted-foreground'),
    };
  }

  private baseOptionsBar(): ChartConfiguration<'bar'>['options'] {
    const tooltipBg = this.getTooltipBackground();
    const labelColor = this.getLabelColor();

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 12 },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: tooltipBg,
          padding: 12,
          cornerRadius: 8,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          displayColors: true,
        },
        datalabels: {
          align: 'end',
          anchor: 'end',
          color: labelColor,
          font: { size: 10, weight: 'bold' },
          formatter: (v: unknown) => (typeof v === 'number' && v > 0 ? String(v) : ''),
          clamp: true,
          offset: 2,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: this.palette.tick,
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: this.palette.grid,
            lineWidth: 1,
          },
          ticks: {
            precision: 0,
            color: this.palette.tick,
            font: { size: 11 },
          },
        },
      },
    };
  }
  // Expose for ng2-charts templates
  barOptions(params?: { showLegend?: boolean }): ChartConfiguration<'bar'>['options'] {
    const base = (this.baseOptionsBar() || {}) as ChartConfiguration<'bar'>['options'];
    const showLegend = !!params?.showLegend;
    const mergedPlugins = {
      ...((base as any).plugins || {}),
      legend: {
        display: showLegend,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
          boxWidth: 8,
          boxHeight: 8,
        },
      },
    } as any;
    return { ...(base as any), plugins: mergedPlugins } as any;
  }
  private baseOptionsLine(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: this.palette.tick } },
        y: {
          beginAtZero: true,
          grid: { color: this.palette.grid },
          ticks: { precision: 0, color: this.palette.tick },
        },
      },
    };
  }

  createBar(
    ctx: CanvasRenderingContext2D,
    labels: string[],
    values: number[],
    opts?: {
      dataset?: Partial<ChartConfiguration<'bar'>['data']['datasets'][number]>;
      options?: ChartConfiguration<'bar'>['options'];
    }
  ): Chart<'bar'> {
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Series',
            data: values,
            backgroundColor: this.palette.chart1,
            borderColor: this.palette.chart1Border,
            borderRadius: 8,
            borderWidth: 2,
            barThickness: 'flex',
            hoverBackgroundColor: this.palette.chart1Hover,
            hoverBorderWidth: 3,
            ...opts?.dataset,
          },
        ],
      },
      options: { ...this.baseOptionsBar(), ...opts?.options },
    };
    return new Chart(ctx, config);
  }

  updateBar(
    chart: Chart<'bar'>,
    labels: string[],
    values: number[],
    opts?: {
      dataset?: Partial<ChartConfiguration<'bar'>['data']['datasets'][number]>;
      options?: ChartConfiguration<'bar'>['options'];
    }
  ) {
    chart.data.labels = labels;
    if (!chart.data.datasets[0]) {
      chart.data.datasets[0] = { label: 'Series', data: [] } as any;
    }
    chart.data.datasets[0].data = values as any;
    if (opts?.dataset) Object.assign(chart.data.datasets[0], opts.dataset);
    // Ensure legend is visible for multi datasets
    const base = { plugins: { legend: { display: true } } } as ChartConfiguration<'bar'>['options'];
    chart.options = { ...(chart.options || {}), ...base, ...(opts?.options || {}) } as any;
    chart.update();
  }

  // Line helpers (future-proofing)
  createLine(
    ctx: CanvasRenderingContext2D,
    labels: string[],
    values: number[],
    opts?: {
      dataset?: Partial<ChartConfiguration<'line'>['data']['datasets'][number]>;
      options?: ChartConfiguration<'line'>['options'];
    }
  ): Chart<'line'> {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Series',
            data: values,
            borderColor: this.palette.chart1Border,
            backgroundColor: this.palette.chart1,
            pointRadius: 2,
            pointHoverRadius: 3,
            tension: 0.3,
            fill: false,
            ...opts?.dataset,
          },
        ],
      },
      options: { ...this.baseOptionsLine(), ...opts?.options },
    };
    return new Chart(ctx, config);
  }

  updateLine(
    chart: Chart<'line'>,
    labels: string[],
    values: number[],
    opts?: {
      dataset?: Partial<ChartConfiguration<'line'>['data']['datasets'][number]>;
      options?: ChartConfiguration<'line'>['options'];
    }
  ) {
    chart.data.labels = labels;
    if (!chart.data.datasets[0]) {
      chart.data.datasets[0] = { label: 'Series', data: [] } as any;
    }
    chart.data.datasets[0].data = values as any;
    if (opts?.dataset) Object.assign(chart.data.datasets[0], opts.dataset);
    if (opts?.options) chart.options = { ...(chart.options || {}), ...opts.options } as any;
    chart.update();
  }

  destroy(chart: Chart | null | undefined) {
    try {
      chart?.destroy();
    } catch {}
  }

  // Multi-dataset bar helpers
  createBarMulti(
    ctx: CanvasRenderingContext2D,
    labels: string[],
    datasets: Array<Partial<ChartDataset<'bar', number[]>> & { label: string; data: number[] }>,
    opts?: { options?: ChartConfiguration<'bar'>['options'] }
  ): Chart<'bar'> {
    const ds: ChartDataset<'bar', number[]>[] = datasets.map((d, i) => {
      const { label, data, ...rest } = d as any;
      return {
        ...rest,
        label,
        data,
        backgroundColor: d.backgroundColor ?? (i === 0 ? this.palette.chart1 : this.palette.chart2),
        borderColor:
          d.borderColor ?? (i === 0 ? this.palette.chart1Border : this.palette.chart2Border),
        borderRadius: 8,
        borderWidth: 2,
        barThickness: 'flex',
        hoverBackgroundColor:
          d.hoverBackgroundColor ?? (i === 0 ? this.palette.chart1Hover : this.palette.chart2Hover),
        hoverBorderWidth: 3,
      } as ChartDataset<'bar', number[]>;
    });
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: { labels, datasets: ds },
      options: {
        ...this.baseOptionsBar(),
        plugins: { legend: { display: true } },
        ...opts?.options,
      },
    };
    return new Chart(ctx, config);
  }

  updateBarMulti(
    chart: Chart<'bar'>,
    labels: string[],
    datasets: Array<Partial<ChartDataset<'bar', number[]>> & { label: string; data: number[] }>,
    opts?: { options?: ChartConfiguration<'bar'>['options'] }
  ) {
    chart.data.labels = labels;
    chart.data.datasets = datasets.map((d, i) => {
      const { label, data, ...rest } = d as any;
      return {
        type: 'bar',
        ...rest,
        label,
        data,
        backgroundColor: d.backgroundColor ?? (i === 0 ? this.palette.chart1 : this.palette.chart2),
        borderColor:
          d.borderColor ?? (i === 0 ? this.palette.chart1Border : this.palette.chart2Border),
        borderRadius: 8,
        borderWidth: 2,
        barThickness: 'flex',
        hoverBackgroundColor:
          d.hoverBackgroundColor ?? (i === 0 ? this.palette.chart1Hover : this.palette.chart2Hover),
        hoverBorderWidth: 3,
      } as any;
    });
    if (opts?.options) chart.options = { ...(chart.options || {}), ...opts.options } as any;
    chart.update();
  }
}
