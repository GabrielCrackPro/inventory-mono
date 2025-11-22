import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from '@core/services';

export type ThemeMode = 'light' | 'dark';
export type ColorScheme =
  | 'default'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'rose'
  | 'teal'
  | 'custom';

export interface CustomThemeColors {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  customColors?: CustomThemeColors;
}

export interface ThemeExport {
  name: string;
  version: string;
  config: ThemeConfig;
  timestamp: string;
}

interface ColorSchemeVars {
  light: Record<string, string>;
  dark: Record<string, string>;
}

const COLOR_SCHEMES: Record<ColorScheme, ColorSchemeVars> = {
  default: {
    light: {},
    dark: {},
  },
  blue: {
    light: {
      '--primary': 'oklch(0.50 0.24 255)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.96 0.02 255)',
      '--secondary-foreground': 'oklch(0.30 0.08 255)',
      '--accent': 'oklch(0.94 0.03 255)',
      '--accent-foreground': 'oklch(0.35 0.10 255)',
      '--ring': 'oklch(0.58 0.22 255)',
      '--chart-1': 'oklch(0.55 0.25 255)',
      '--chart-2': 'oklch(0.60 0.20 235)',
      '--chart-3': 'oklch(0.50 0.22 275)',
      '--chart-4': 'oklch(0.65 0.18 245)',
      '--chart-5': 'oklch(0.58 0.24 265)',
      '--sidebar-primary': 'oklch(0.50 0.24 255)',
      '--sidebar-accent': 'oklch(0.96 0.02 255)',
      '--sidebar-ring': 'oklch(0.58 0.22 255)',
    },
    dark: {
      '--primary': 'oklch(0.72 0.24 255)',
      '--primary-foreground': 'oklch(0.12 0.02 255)',
      '--secondary': 'oklch(0.26 0.03 255)',
      '--secondary-foreground': 'oklch(0.88 0.06 255)',
      '--accent': 'oklch(0.32 0.04 255)',
      '--accent-foreground': 'oklch(0.92 0.06 255)',
      '--ring': 'oklch(0.65 0.22 255)',
      '--chart-1': 'oklch(0.68 0.25 255)',
      '--chart-2': 'oklch(0.72 0.20 235)',
      '--chart-3': 'oklch(0.62 0.22 275)',
      '--chart-4': 'oklch(0.75 0.18 245)',
      '--chart-5': 'oklch(0.70 0.24 265)',
      '--sidebar-primary': 'oklch(0.72 0.24 255)',
      '--sidebar-accent': 'oklch(0.26 0.03 255)',
      '--sidebar-ring': 'oklch(0.65 0.22 255)',
    },
  },
  green: {
    light: {
      '--primary': 'oklch(0.55 0.19 145)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.96 0.02 145)',
      '--secondary-foreground': 'oklch(0.30 0.08 145)',
      '--accent': 'oklch(0.94 0.03 145)',
      '--accent-foreground': 'oklch(0.35 0.10 145)',
      '--ring': 'oklch(0.60 0.18 145)',
      '--chart-1': 'oklch(0.62 0.20 145)',
      '--chart-2': 'oklch(0.65 0.18 125)',
      '--chart-3': 'oklch(0.58 0.16 165)',
      '--chart-4': 'oklch(0.68 0.19 135)',
      '--chart-5': 'oklch(0.60 0.22 155)',
      '--sidebar-primary': 'oklch(0.55 0.19 145)',
      '--sidebar-accent': 'oklch(0.96 0.02 145)',
      '--sidebar-ring': 'oklch(0.60 0.18 145)',
    },
    dark: {
      '--primary': 'oklch(0.70 0.20 145)',
      '--primary-foreground': 'oklch(0.10 0.02 145)',
      '--secondary': 'oklch(0.26 0.03 145)',
      '--secondary-foreground': 'oklch(0.88 0.06 145)',
      '--accent': 'oklch(0.32 0.04 145)',
      '--accent-foreground': 'oklch(0.92 0.06 145)',
      '--ring': 'oklch(0.65 0.18 145)',
      '--chart-1': 'oklch(0.68 0.20 145)',
      '--chart-2': 'oklch(0.72 0.18 125)',
      '--chart-3': 'oklch(0.64 0.16 165)',
      '--chart-4': 'oklch(0.75 0.19 135)',
      '--chart-5': 'oklch(0.68 0.22 155)',
      '--sidebar-primary': 'oklch(0.70 0.20 145)',
      '--sidebar-accent': 'oklch(0.26 0.03 145)',
      '--sidebar-ring': 'oklch(0.65 0.18 145)',
    },
  },
  purple: {
    light: {
      '--primary': 'oklch(0.52 0.25 295)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.96 0.02 295)',
      '--secondary-foreground': 'oklch(0.30 0.10 295)',
      '--accent': 'oklch(0.94 0.03 295)',
      '--accent-foreground': 'oklch(0.35 0.12 295)',
      '--ring': 'oklch(0.58 0.24 295)',
      '--chart-1': 'oklch(0.60 0.26 295)',
      '--chart-2': 'oklch(0.64 0.24 275)',
      '--chart-3': 'oklch(0.56 0.25 315)',
      '--chart-4': 'oklch(0.68 0.22 285)',
      '--chart-5': 'oklch(0.62 0.28 305)',
      '--sidebar-primary': 'oklch(0.52 0.25 295)',
      '--sidebar-accent': 'oklch(0.96 0.02 295)',
      '--sidebar-ring': 'oklch(0.58 0.24 295)',
    },
    dark: {
      '--primary': 'oklch(0.74 0.25 295)',
      '--primary-foreground': 'oklch(0.10 0.02 295)',
      '--secondary': 'oklch(0.26 0.03 295)',
      '--secondary-foreground': 'oklch(0.88 0.08 295)',
      '--accent': 'oklch(0.32 0.04 295)',
      '--accent-foreground': 'oklch(0.92 0.08 295)',
      '--ring': 'oklch(0.66 0.24 295)',
      '--chart-1': 'oklch(0.70 0.26 295)',
      '--chart-2': 'oklch(0.74 0.24 275)',
      '--chart-3': 'oklch(0.66 0.25 315)',
      '--chart-4': 'oklch(0.78 0.22 285)',
      '--chart-5': 'oklch(0.72 0.28 305)',
      '--sidebar-primary': 'oklch(0.74 0.25 295)',
      '--sidebar-accent': 'oklch(0.26 0.03 295)',
      '--sidebar-ring': 'oklch(0.66 0.24 295)',
    },
  },
  orange: {
    light: {
      '--primary': 'oklch(0.60 0.21 40)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.96 0.02 40)',
      '--secondary-foreground': 'oklch(0.30 0.08 40)',
      '--accent': 'oklch(0.94 0.03 40)',
      '--accent-foreground': 'oklch(0.35 0.10 40)',
      '--ring': 'oklch(0.65 0.20 40)',
      '--chart-1': 'oklch(0.68 0.22 40)',
      '--chart-2': 'oklch(0.70 0.20 25)',
      '--chart-3': 'oklch(0.65 0.19 55)',
      '--chart-4': 'oklch(0.72 0.18 35)',
      '--chart-5': 'oklch(0.66 0.24 45)',
      '--sidebar-primary': 'oklch(0.60 0.21 40)',
      '--sidebar-accent': 'oklch(0.96 0.02 40)',
      '--sidebar-ring': 'oklch(0.65 0.20 40)',
    },
    dark: {
      '--primary': 'oklch(0.74 0.21 40)',
      '--primary-foreground': 'oklch(0.10 0.02 40)',
      '--secondary': 'oklch(0.26 0.03 40)',
      '--secondary-foreground': 'oklch(0.88 0.06 40)',
      '--accent': 'oklch(0.32 0.04 40)',
      '--accent-foreground': 'oklch(0.92 0.06 40)',
      '--ring': 'oklch(0.68 0.20 40)',
      '--chart-1': 'oklch(0.72 0.22 40)',
      '--chart-2': 'oklch(0.75 0.20 25)',
      '--chart-3': 'oklch(0.70 0.19 55)',
      '--chart-4': 'oklch(0.77 0.18 35)',
      '--chart-5': 'oklch(0.72 0.24 45)',
      '--sidebar-primary': 'oklch(0.74 0.21 40)',
      '--sidebar-accent': 'oklch(0.26 0.03 40)',
      '--sidebar-ring': 'oklch(0.68 0.20 40)',
    },
  },
  rose: {
    light: {
      '--primary': 'oklch(0.56 0.23 12)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.96 0.02 12)',
      '--secondary-foreground': 'oklch(0.30 0.09 12)',
      '--accent': 'oklch(0.94 0.03 12)',
      '--accent-foreground': 'oklch(0.35 0.11 12)',
      '--ring': 'oklch(0.62 0.22 12)',
      '--chart-1': 'oklch(0.64 0.24 12)',
      '--chart-2': 'oklch(0.68 0.22 355)',
      '--chart-3': 'oklch(0.60 0.23 25)',
      '--chart-4': 'oklch(0.70 0.20 5)',
      '--chart-5': 'oklch(0.66 0.26 18)',
      '--sidebar-primary': 'oklch(0.56 0.23 12)',
      '--sidebar-accent': 'oklch(0.96 0.02 12)',
      '--sidebar-ring': 'oklch(0.62 0.22 12)',
    },
    dark: {
      '--primary': 'oklch(0.72 0.23 12)',
      '--primary-foreground': 'oklch(0.10 0.02 12)',
      '--secondary': 'oklch(0.26 0.03 12)',
      '--secondary-foreground': 'oklch(0.88 0.07 12)',
      '--accent': 'oklch(0.32 0.04 12)',
      '--accent-foreground': 'oklch(0.92 0.07 12)',
      '--ring': 'oklch(0.66 0.22 12)',
      '--chart-1': 'oklch(0.70 0.24 12)',
      '--chart-2': 'oklch(0.74 0.22 355)',
      '--chart-3': 'oklch(0.68 0.23 25)',
      '--chart-4': 'oklch(0.76 0.20 5)',
      '--chart-5': 'oklch(0.72 0.26 18)',
      '--sidebar-primary': 'oklch(0.72 0.23 12)',
      '--sidebar-accent': 'oklch(0.26 0.03 12)',
      '--sidebar-ring': 'oklch(0.66 0.22 12)',
    },
  },
  teal: {
    light: {
      '--primary': 'oklch(0.54 0.18 185)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.96 0.02 185)',
      '--secondary-foreground': 'oklch(0.30 0.08 185)',
      '--accent': 'oklch(0.94 0.03 185)',
      '--accent-foreground': 'oklch(0.35 0.10 185)',
      '--ring': 'oklch(0.60 0.17 185)',
      '--chart-1': 'oklch(0.62 0.20 185)',
      '--chart-2': 'oklch(0.66 0.18 165)',
      '--chart-3': 'oklch(0.58 0.16 205)',
      '--chart-4': 'oklch(0.68 0.19 175)',
      '--chart-5': 'oklch(0.64 0.22 195)',
      '--sidebar-primary': 'oklch(0.54 0.18 185)',
      '--sidebar-accent': 'oklch(0.96 0.02 185)',
      '--sidebar-ring': 'oklch(0.60 0.17 185)',
    },
    dark: {
      '--primary': 'oklch(0.70 0.20 185)',
      '--primary-foreground': 'oklch(0.10 0.02 185)',
      '--secondary': 'oklch(0.26 0.03 185)',
      '--secondary-foreground': 'oklch(0.88 0.06 185)',
      '--accent': 'oklch(0.32 0.04 185)',
      '--accent-foreground': 'oklch(0.92 0.06 185)',
      '--ring': 'oklch(0.65 0.19 185)',
      '--chart-1': 'oklch(0.68 0.22 185)',
      '--chart-2': 'oklch(0.72 0.20 165)',
      '--chart-3': 'oklch(0.64 0.18 205)',
      '--chart-4': 'oklch(0.75 0.21 175)',
      '--chart-5': 'oklch(0.70 0.24 195)',
      '--sidebar-primary': 'oklch(0.70 0.20 185)',
      '--sidebar-accent': 'oklch(0.26 0.03 185)',
      '--sidebar-ring': 'oklch(0.65 0.19 185)',
    },
  },
  custom: {
    light: {},
    dark: {},
  },
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeKey = 'hia-theme';
  private readonly colorSchemeKey = 'hia-color-scheme';
  private readonly customColorsKey = 'hia-custom-colors';
  private readonly _storageService = inject(StorageService);

  readonly currentTheme = signal<ThemeMode>('light');
  readonly currentColorScheme = signal<ColorScheme>('default');
  private customColors: CustomThemeColors | null = null;

  initTheme(): void {
    const savedTheme = this._storageService.getItem(this.themeKey) as ThemeMode | null;
    const savedColorScheme =
      (this._storageService.getItem(this.colorSchemeKey) as ColorScheme) || 'default';

    // Load custom colors if they exist
    const savedCustomColors = this._storageService.getItem(this.customColorsKey);
    if (savedCustomColors && typeof savedCustomColors === 'string') {
      try {
        this.customColors = JSON.parse(savedCustomColors);
      } catch {
        this.customColors = null;
      }
    }

    const isDark =
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.applyTheme(isDark ? 'dark' : 'light');
    this.applyColorScheme(savedColorScheme);
  }

  setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
  }

  setColorScheme(scheme: ColorScheme): void {
    this.applyColorScheme(scheme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  private applyTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    const isDark = theme === 'dark';

    html.classList.toggle('dark', isDark);
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme;

    this._storageService.setItem(this.themeKey, theme);
    this.currentTheme.set(theme);

    // Reapply color scheme for the new theme mode
    const currentScheme = this.currentColorScheme();
    if (currentScheme !== 'default') {
      this.applyColorScheme(currentScheme);
    }
  }

  setCustomColors(colors: CustomThemeColors): void {
    this.customColors = colors;
    this._storageService.setItem(this.customColorsKey, JSON.stringify(colors));
    this.applyColorScheme('custom');
  }

  getCustomColors(): CustomThemeColors | null {
    return this.customColors;
  }

  getCurrentConfig(): ThemeConfig {
    return {
      mode: this.currentTheme(),
      colorScheme: this.currentColorScheme(),
      customColors: this.customColors || undefined,
    };
  }

  exportTheme(): ThemeExport {
    return {
      name: 'Custom Theme',
      version: '1.0.0',
      config: this.getCurrentConfig(),
      timestamp: new Date().toISOString(),
    };
  }

  importTheme(themeExport: ThemeExport): boolean {
    try {
      const { config } = themeExport;

      if (config.customColors) {
        this.setCustomColors(config.customColors);
      }

      this.setTheme(config.mode);
      this.setColorScheme(config.colorScheme);

      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  resetToDefaults(): void {
    this.customColors = null;
    this._storageService.removeItem(this.customColorsKey);
    this.applyTheme('light');
    this.applyColorScheme('default');
  }

  private applyColorScheme(scheme: ColorScheme): void {
    const html = document.documentElement;
    const currentMode = this.currentTheme();

    let colors: Record<string, string>;

    if (scheme === 'custom' && this.customColors) {
      colors = this.customColors[currentMode];
    } else if (scheme !== 'custom') {
      const schemeColors = COLOR_SCHEMES[scheme];
      colors = schemeColors[currentMode];
    } else {
      // Custom selected but no custom colors saved, fallback to default
      colors = {};
    }

    // Reset previously applied color scheme variables
    const allVars = new Set<string>();
    Object.values(COLOR_SCHEMES).forEach((scheme) => {
      Object.keys(scheme.light).forEach((key) => allVars.add(key));
      Object.keys(scheme.dark).forEach((key) => allVars.add(key));
    });
    allVars.forEach((key) => html.style.removeProperty(key));

    // Apply new color scheme
    Object.entries(colors).forEach(([key, value]) => {
      html.style.setProperty(key, value);
    });

    html.setAttribute('data-color-scheme', scheme);
    this._storageService.setItem(this.colorSchemeKey, scheme);
    this.currentColorScheme.set(scheme);
  }
}
