import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconName } from '@core/config';
import { ThemeService, ColorScheme, ThemeMode } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import { ZardDropdownMenuComponent } from '@ui/dropdown';
import { IconComponent } from '@ui/icon';

interface ColorSchemeOption {
  value: ColorScheme;
  label: string;
  icon: IconName;
  colors: string[];
  description?: string;
}

@Component({
  selector: 'hia-theme-switcher',
  standalone: true,
  imports: [ZardButtonComponent, ZardDropdownMenuComponent, IconComponent, RouterLink],
  templateUrl: './theme-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  readonly themeService = inject(ThemeService);

  readonly colorSchemes: ColorSchemeOption[] = [
    {
      value: 'default',
      label: 'Default',
      icon: 'lucideCircle',
      colors: ['oklch(0.556 0 0)', 'oklch(0.922 0 0)'],
      description: 'Classic neutral',
    },
    {
      value: 'blue',
      label: 'Ocean Blue',
      icon: 'lucideCircle',
      colors: ['oklch(0.50 0.24 255)', 'oklch(0.72 0.24 255)'],
      description: 'Cool & professional',
    },
    {
      value: 'green',
      label: 'Forest Green',
      icon: 'lucideCircle',
      colors: ['oklch(0.55 0.19 145)', 'oklch(0.70 0.20 145)'],
      description: 'Fresh & natural',
    },
    {
      value: 'purple',
      label: 'Royal Purple',
      icon: 'lucideCircle',
      colors: ['oklch(0.52 0.25 295)', 'oklch(0.74 0.25 295)'],
      description: 'Creative & modern',
    },
    {
      value: 'orange',
      label: 'Sunset Orange',
      icon: 'lucideCircle',
      colors: ['oklch(0.60 0.21 40)', 'oklch(0.74 0.21 40)'],
      description: 'Warm & energetic',
    },
    {
      value: 'rose',
      label: 'Blossom Rose',
      icon: 'lucideCircle',
      colors: ['oklch(0.56 0.23 12)', 'oklch(0.72 0.23 12)'],
      description: 'Elegant & romantic',
    },
    {
      value: 'teal',
      label: 'Aqua Teal',
      icon: 'lucideCircle',
      colors: ['oklch(0.54 0.18 185)', 'oklch(0.70 0.20 185)'],
      description: 'Calm & balanced',
    },
    {
      value: 'custom',
      label: 'Custom Theme',
      icon: 'lucideWand2',
      colors: [],
      description: 'Your own colors',
    },
  ];

  get currentTheme(): ThemeMode {
    return this.themeService.currentTheme();
  }

  get currentColorScheme(): ColorScheme {
    return this.themeService.currentColorScheme();
  }

  get themeIcon(): IconName {
    // Use sparkles icon to represent theme customization/magic
    // Alternative: 'lucidePaintbrush' for a more literal paint/theme icon
    return 'lucideSparkles';
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }

  setColorScheme(scheme: ColorScheme): void {
    this.themeService.setColorScheme(scheme);
  }

  getSchemeLabel(scheme: ColorScheme): string {
    const option = this.colorSchemes.find((s) => s.value === scheme);
    return option?.label || 'Default';
  }

  getCurrentSchemeColors(): string[] {
    const option = this.colorSchemes.find((s) => s.value === this.currentColorScheme);
    return option?.colors || [];
  }

  getCurrentSchemeColor(): string {
    const colors = this.getCurrentSchemeColors();
    return colors.length > 0 ? colors[0] : 'var(--primary)';
  }
}
