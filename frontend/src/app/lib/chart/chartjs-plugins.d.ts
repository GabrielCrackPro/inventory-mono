// Minimal typings for chartjs-plugin-datalabels and plugin option augmentation
import type { ChartType } from 'chart.js';

declare module 'chartjs-plugin-datalabels' {
  import type { Plugin } from 'chart.js';
  const ChartDataLabels: Plugin;
  export default ChartDataLabels;
}

declare module 'chart.js' {
  // Allow using options.plugins.datalabels without TS errors
  interface PluginOptionsByType<TType extends ChartType> {
    datalabels?: unknown;
  }
}
