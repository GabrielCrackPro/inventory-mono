import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import * as lucideIcons from '@ng-icons/lucide';
import * as matBaseline from '@ng-icons/material-icons/baseline';
import * as matOutline from '@ng-icons/material-icons/outline';
import * as svgIcons from '@ng-icons/svgl';
import * as tablerIcons from '@ng-icons/tabler-icons';

const allIcons = {
  ...lucideIcons,
  ...matBaseline,
  ...matOutline,
  ...tablerIcons,
  ...svgIcons,
};

export const iconProviders = [
  provideNgIconsConfig({
    size: '1.5rem',
    color: 'currentColor',
  }),
  provideIcons(allIcons),
];

export const commonIcons: Record<string, IconName> = {
  // Core entities
  dashboard: 'lucideLayoutDashboard',
  item: 'lucideBox',
  house: 'lucideHouse',
  room: 'lucideBed',
  category: 'lucideTag',
  user: 'lucideUser',
  logo: 'lucideBox',

  // Actions
  add: 'lucidePlus',
  edit: 'lucidePencil',
  delete: 'lucideTrash',
  save: 'lucideCheck',
  cancel: 'lucideX',
  refresh: 'lucideRefreshCcw',
  download: 'lucideDownload',
  upload: 'lucideUpload',
  search: 'lucideSearch',
  filter: 'lucideFilter',
  settings: 'lucideSettings',
  share: 'lucideShare2',
  copy: 'lucideCopy',

  // Navigation
  back: 'lucideArrowLeft',
  forward: 'lucideArrowRight',
  up: 'lucideChevronUp',
  down: 'lucideChevronDown',
  left: 'lucideChevronLeft',
  right: 'lucideChevronRight',

  // Status & feedback
  success: 'lucideCircleCheck',
  warning: 'lucideTriangleAlert',
  error: 'lucideCircleX',
  info: 'lucideInfo',
  loading: 'lucideLoaderCircle',

  // UI elements
  menu: 'lucideMenu',
  close: 'lucideX',
  expand: 'lucideChevronDown',
  collapse: 'lucideChevronUp',
  calendar: 'lucideCalendar',
  history: 'lucideHistory',

  // Inventory specific
  warehouse: 'lucideWarehouse',
  boxes: 'lucideBoxes',
  quantity: 'lucideHash',

  // List operations
  selectAll: 'lucideListChecks',
  deselectAll: 'lucideListX',

  // House operations
  addHouse: 'lucideHousePlus',
};

export type IconName = keyof typeof allIcons;
