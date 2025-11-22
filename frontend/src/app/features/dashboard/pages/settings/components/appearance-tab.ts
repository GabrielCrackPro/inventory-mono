import { Component, inject } from '@angular/core';
import { DialogService } from '@shared/services/dialog';
import { ThemeService, type ColorScheme, type ThemeMode } from '@shared/services/theme';
import { ZardButtonComponent } from '@ui/button';
import { IconComponent } from '@ui/icon';
import { CustomThemeModalComponent } from './custom-theme-modal';
import { ThemeInfoModalComponent } from './theme-info-modal';

interface ColorSchemeOption {
  value: ColorScheme;
  label: string;
  description: string;
  preview: string;
}

@Component({
  selector: 'hia-settings-appearance-tab',
  standalone: true,
  imports: [ZardButtonComponent, IconComponent],
  template: `
    <div class="space-y-8">
      <!-- Theme Mode Section -->
      <div
        class="rounded-xl bg-linear-to-br from-card to-card/50 border border-border/60 p-6 space-y-4"
      >
        <div class="space-y-1">
          <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
            <hia-icon name="lucideMoon" [size]="20" />
            Theme Mode
          </h3>
          <p class="text-sm text-muted-foreground">Choose between light and dark mode</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Light Mode -->
          <label
            class="relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50"
            [class.border-primary]="themeService.currentTheme() === 'light'"
            [class.border-border]="themeService.currentTheme() !== 'light'"
            [class.bg-primary/5]="themeService.currentTheme() === 'light'"
          >
            <input
              type="radio"
              name="theme"
              value="light"
              class="sr-only"
              [checked]="themeService.currentTheme() === 'light'"
              (change)="onThemeChange('light')"
            />
            <div
              class="w-12 h-12 rounded-lg bg-linear-to-br from-white to-gray-100 border border-gray-300 flex items-center justify-center"
            >
              <hia-icon name="lucideSun" [size]="24" class="text-yellow-500" />
            </div>
            <div class="flex-1">
              <div class="font-medium text-foreground">Light</div>
              <div class="text-xs text-muted-foreground">Bright and clear</div>
            </div>
            @if(themeService.currentTheme() === 'light') {
            <div class="absolute top-2 right-2">
              <hia-icon name="lucideCheckCircle" [size]="20" class="text-primary" />
            </div>
            }
          </label>

          <!-- Dark Mode -->
          <label
            class="relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50"
            [class.border-primary]="themeService.currentTheme() === 'dark'"
            [class.border-border]="themeService.currentTheme() !== 'dark'"
            [class.bg-primary/5]="themeService.currentTheme() === 'dark'"
          >
            <input
              type="radio"
              name="theme"
              value="dark"
              class="sr-only"
              [checked]="themeService.currentTheme() === 'dark'"
              (change)="onThemeChange('dark')"
            />
            <div
              class="w-12 h-12 rounded-lg bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center"
            >
              <hia-icon name="lucideMoon" [size]="24" class="text-blue-400" />
            </div>
            <div class="flex-1">
              <div class="font-medium text-foreground">Dark</div>
              <div class="text-xs text-muted-foreground">Easy on the eyes</div>
            </div>
            @if(themeService.currentTheme() === 'dark') {
            <div class="absolute top-2 right-2">
              <hia-icon name="lucideCheckCircle" [size]="20" class="text-primary" />
            </div>
            }
          </label>
        </div>
      </div>

      <!-- Color Scheme Section -->
      <div
        class="rounded-xl bg-linear-to-br from-card to-card/50 border border-border/60 p-6 space-y-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
              <hia-icon name="lucidePalette" [size]="20" />
              Color Scheme
            </h3>
            <p class="text-sm text-muted-foreground">
              Customize the accent color throughout the app
            </p>
          </div>
          <z-button zType="ghost" zSize="icon" iconName="lucideInfo" (click)="openThemeInfo()"/>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for(option of colorSchemeOptions; track option.value) {
          <label
            class="relative flex flex-col gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50"
            [class.border-primary]="themeService.currentColorScheme() === option.value"
            [class.border-border]="themeService.currentColorScheme() !== option.value"
            [class.bg-primary/5]="themeService.currentColorScheme() === option.value"
          >
            <input
              type="radio"
              name="colorScheme"
              [value]="option.value"
              class="sr-only"
              [checked]="themeService.currentColorScheme() === option.value"
              (change)="onColorSchemeChange(option.value)"
            />
            <div class="flex items-center justify-between">
              <div class="font-medium text-foreground">{{ option.label }}</div>
              @if(themeService.currentColorScheme() === option.value) {
              <hia-icon name="lucideCheckCircle" [size]="18" class="text-primary" />
              }
            </div>
            @if(option.value === 'custom') {
            <div class="flex items-center justify-center h-16">
              <z-button zType="outline" zSize="sm" iconName="lucideWand2" label="Customize Colors" [iconSize]="16" (click)="openCustomTheme(); $event.stopPropagation()"/>
            </div>
            } @else {
            <div class="flex gap-2">
              @for(color of getPreviewColors(option.preview); track $index) {
              <div class="w-8 h-8 rounded-md" [style.background]="color"></div>
              }
            </div>
            }
            <div class="text-xs text-muted-foreground">{{ option.description }}</div>
          </label>
          }
        </div>
      </div>

      <!-- Preview Section -->
      <div
        class="rounded-xl bg-linear-to-br from-card to-card/50 border border-border/60 p-6 space-y-4"
      >
        <div class="space-y-1">
          <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
            <hia-icon name="lucideEye" [size]="20" />
            Live Preview
          </h3>
          <p class="text-sm text-muted-foreground">See how your theme looks in action</p>
        </div>

        <div class="space-y-4">
          <!-- Buttons Preview -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Buttons</div>
            <div class="flex flex-wrap gap-2">
              <z-button zType="default" size="sm" label="Primary"/>
              <z-button zType="secondary" size="sm" label="Secondary" />
              <z-button zType="outline" size="sm" label="Outline"/>
              <z-button zType="ghost" size="sm" label="Ghost"/>
            </div>
          </div>

          <!-- Text Preview -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Typography</div>
            <div class="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
              <p class="text-base font-semibold text-foreground">
                Primary text with your theme colors
              </p>
              <p class="text-sm text-foreground">
                Regular text for body content and descriptions
              </p>
              <p class="text-xs text-muted-foreground">
                Muted text for secondary information and hints
              </p>
            </div>
          </div>

          <!-- Status Colors Preview -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status Colors</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div class="p-3 rounded-lg border-2 border-chart-1 [background:color-mix(in_srgb,var(--chart-1)_10%,transparent)]">
                <div class="text-xs font-medium text-chart-1">Info</div>
              </div>
              <div class="p-3 rounded-lg border-2 border-chart-2 [background:color-mix(in_srgb,var(--chart-2)_10%,transparent)]">
                <div class="text-xs font-medium text-chart-2">Success</div>
              </div>
              <div class="p-3 rounded-lg border-2 border-chart-3 [background:color-mix(in_srgb,var(--chart-3)_10%,transparent)]">
                <div class="text-xs font-medium text-chart-3">Warning</div>
              </div>
              <div class="p-3 rounded-lg border-2 border-destructive bg-destructive/10">
                <div class="text-xs font-medium text-destructive">Error</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsAppearanceTabComponent {
  readonly themeService = inject(ThemeService);
  private readonly dialogService = inject(DialogService);

  readonly colorSchemeOptions: ColorSchemeOption[] = [
    {
      value: 'default',
      label: 'Default',
      description: 'Classic neutral theme',
      preview: 'oklch(0.205 0 0),oklch(0.556 0 0),oklch(0.922 0 0)',
    },
    {
      value: 'blue',
      label: 'Blue',
      description: 'Cool and professional',
      preview: 'oklch(0.50 0.24 255),oklch(0.58 0.22 255),oklch(0.72 0.24 255)',
    },
    {
      value: 'green',
      label: 'Green',
      description: 'Fresh and natural',
      preview: 'oklch(0.55 0.19 145),oklch(0.60 0.18 145),oklch(0.70 0.20 145)',
    },
    {
      value: 'purple',
      label: 'Purple',
      description: 'Creative and modern',
      preview: 'oklch(0.52 0.25 295),oklch(0.58 0.24 295),oklch(0.74 0.25 295)',
    },
    {
      value: 'orange',
      label: 'Orange',
      description: 'Warm and energetic',
      preview: 'oklch(0.60 0.21 40),oklch(0.65 0.20 40),oklch(0.74 0.21 40)',
    },
    {
      value: 'rose',
      label: 'Rose',
      description: 'Elegant and romantic',
      preview: 'oklch(0.56 0.23 12),oklch(0.62 0.22 12),oklch(0.72 0.23 12)',
    },
    {
      value: 'teal',
      label: 'Teal',
      description: 'Calm and balanced',
      preview: 'oklch(0.54 0.18 185),oklch(0.60 0.17 185),oklch(0.70 0.20 185)',
    },
    {
      value: 'custom',
      label: 'Custom',
      description: 'Your own colors',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  ];

  onThemeChange(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
  }

  onColorSchemeChange(scheme: ColorScheme): void {
    if (scheme === 'custom') {
      this.openCustomTheme();
    } else {
      this.themeService.setColorScheme(scheme);
    }
  }

  openCustomTheme(): void {
    this.dialogService.create({
      zContent: CustomThemeModalComponent,
      zSize: 'lg',
      zHideFooter: true,
    });
  }

  openThemeInfo(): void {
    this.dialogService.create({
      zContent: ThemeInfoModalComponent,
      zSize: 'lg',
      zHideFooter: true,
    });
  }

  getPreviewColors(preview: string): string[] {
    return preview.split(',');
  }
}
