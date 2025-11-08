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

export type IconName = keyof typeof allIcons;
