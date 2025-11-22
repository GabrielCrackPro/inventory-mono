import { Component, inject, signal, computed, viewChild, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ZardDialogRef } from '@ui/dialog';
import { ZardButtonComponent } from '@ui/button';
import { ZardFormModule } from '@ui/form';
import { ZardInputDirective } from '@ui/input';
import { IconComponent } from '@ui/icon';
import { ThemeService, CustomThemeColors } from '@shared/services/theme';
import { ToastService } from '@shared/services/toast';
import { ZardTabComponent, ZardTabGroupComponent } from '@ui/tabs';
import { ZardAlertComponent } from '@ui/alert';
import { ZardColorPickerComponent } from '@ui/color-picker';

@Component({
  selector: 'hia-custom-theme-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardFormModule,
    ZardInputDirective,
    IconComponent,
    ZardTabGroupComponent,
    ZardTabComponent,
    ZardAlertComponent,
    ZardColorPickerComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-foreground flex items-center gap-2">
          <hia-icon name="lucidePalette" [size]="24" />
          Custom Theme Colors
        </h2>
        <p class="text-sm text-muted-foreground">
          Define your own colors using OKLCH format for perceptually uniform color spaces
        </p>
      </div>

      <!-- Validation Alert -->
      @if(hasValidationErrors()) {
      <z-alert
        zType="warning"
        zAppearance="soft"
        zTitle="Invalid Color Values"
        zDescription="Please check all fields are in valid OKLCH format"
      />
      }

      <!-- Tabs for Light/Dark -->
      <z-tab-group>
        <z-tab label="Light Mode">
          <div class="py-4">
            <form [formGroup]="lightForm" class="space-y-4">
              <z-form-field>
                <z-form-label>Primary Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(lightForm.get('primary')?.value || defaultLightColors.primary)
                      "
                      (valueChange)="onColorPickCustom($event, 'light', 'primary')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="primary"
                      placeholder="oklch(0.45 0.21 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetLightField('primary')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Primary Foreground</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(
                          lightForm.get('primaryForeground')?.value ||
                            defaultLightColors.primaryForeground
                        )
                      "
                      (valueChange)="onColorPickCustom($event, 'light', 'primaryForeground')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="primaryForeground"
                      placeholder="oklch(0.99 0 0)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetLightField('primaryForeground')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Secondary Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(
                          lightForm.get('secondary')?.value || defaultLightColors.secondary
                        )
                      "
                      (valueChange)="onColorPickCustom($event, 'light', 'secondary')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="secondary"
                      placeholder="oklch(0.96 0.01 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetLightField('secondary')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Accent Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(lightForm.get('accent')?.value || defaultLightColors.accent)
                      "
                      (valueChange)="onColorPickCustom($event, 'light', 'accent')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="accent"
                      placeholder="oklch(0.94 0.02 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetLightField('accent')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Ring Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="oklchToHex(lightForm.get('ring')?.value || defaultLightColors.ring)"
                      (valueChange)="onColorPickCustom($event, 'light', 'ring')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="ring"
                      placeholder="oklch(0.55 0.18 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetLightField('ring')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>
            </form>
          </div>
        </z-tab>

        <z-tab label="Dark Mode">
          <div class="py-4">
            <form [formGroup]="darkForm" class="space-y-4">
              <z-form-field>
                <z-form-label>Primary Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(darkForm.get('primary')?.value || defaultDarkColors.primary)
                      "
                      (valueChange)="onColorPickCustom($event, 'dark', 'primary')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="primary"
                      placeholder="oklch(0.70 0.20 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetDarkField('primary')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Primary Foreground</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(
                          darkForm.get('primaryForeground')?.value ||
                            defaultDarkColors.primaryForeground
                        )
                      "
                      (valueChange)="onColorPickCustom($event, 'dark', 'primaryForeground')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="primaryForeground"
                      placeholder="oklch(0.15 0.02 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetDarkField('primaryForeground')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Secondary Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(darkForm.get('secondary')?.value || defaultDarkColors.secondary)
                      "
                      (valueChange)="onColorPickCustom($event, 'dark', 'secondary')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="secondary"
                      placeholder="oklch(0.25 0.02 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetDarkField('secondary')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Accent Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="
                        oklchToHex(darkForm.get('accent')?.value || defaultDarkColors.accent)
                      "
                      (valueChange)="onColorPickCustom($event, 'dark', 'accent')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="accent"
                      placeholder="oklch(0.30 0.03 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetDarkField('accent')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>

              <z-form-field>
                <z-form-label>Ring Color</z-form-label>
                <z-form-control>
                  <div class="flex items-center gap-2">
                    <z-color-picker
                      [value]="oklchToHex(darkForm.get('ring')?.value || defaultDarkColors.ring)"
                      (valueChange)="onColorPickCustom($event, 'dark', 'ring')"
                      [size]="40"
                    />
                    <input
                      z-input
                      formControlName="ring"
                      placeholder="oklch(0.60 0.18 264)"
                      class="font-mono text-sm flex-1"
                    />
                    <z-button
                      zType="ghost"
                      zSize="icon"
                      (click)="resetDarkField('ring')"
                      title="Reset to default"
                    >
                      <hia-icon name="lucideRotateCcw" [size]="16" />
                    </z-button>
                  </div>
                </z-form-control>
              </z-form-field>
            </form>
          </div>
        </z-tab>
      </z-tab-group>

      <!-- Help Text -->
      <div class="space-y-3">
        <div class="p-4 rounded-lg bg-muted/50 border border-border">
          <div class="flex gap-3">
            <hia-icon name="lucideInfo" [size]="20" class="text-primary shrink-0 mt-0.5" />
            <div class="text-sm space-y-2">
              <p class="font-medium text-foreground">OKLCH Format Guide</p>
              <div class="space-y-1 text-muted-foreground">
                <div><strong>L</strong> (Lightness): 0-1 (0 = black, 1 = white)</div>
                <div><strong>C</strong> (Chroma): 0-0.4 (color intensity/saturation)</div>
                <div><strong>H</strong> (Hue): 0-360 (color angle on wheel)</div>
                <div class="mt-2 text-xs opacity-80">Example: oklch(0.5 0.2 264) = medium blue</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <z-button
            zType="ghost"
            label="Reset All"
            iconName="lucideRotateCcw"
            (click)="resetAll()"
            [disabled]="isSaving()"
          />
          <div class="flex gap-2">
            <z-button zType="outline" label="Cancel" (click)="close()" [disabled]="isSaving()" />
            <z-button
              label="Save & Apply"
              iconName="lucideCheck"
              (click)="save()"
              [disabled]="isSaving() || lightForm.invalid || darkForm.invalid"
              [zLoading]="isSaving()"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CustomThemeModalComponent implements AfterViewInit {
  private readonly dialogRef = inject(ZardDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);

  readonly tabGroup = viewChild(ZardTabGroupComponent);
  readonly isSaving = signal(false);

  readonly hasValidationErrors = computed(() => {
    return (
      (this.lightForm.invalid && this.lightForm.dirty) ||
      (this.darkForm.invalid && this.darkForm.dirty)
    );
  });

  readonly defaultLightColors = {
    primary: 'oklch(0.45 0.21 264)',
    primaryForeground: 'oklch(0.99 0 0)',
    secondary: 'oklch(0.96 0.01 264)',
    accent: 'oklch(0.94 0.02 264)',
    ring: 'oklch(0.55 0.18 264)',
  };

  readonly defaultDarkColors = {
    primary: 'oklch(0.70 0.20 264)',
    primaryForeground: 'oklch(0.15 0.02 264)',
    secondary: 'oklch(0.25 0.02 264)',
    accent: 'oklch(0.30 0.03 264)',
    ring: 'oklch(0.60 0.18 264)',
  };

  readonly lightForm = this.fb.group({
    primary: [this.defaultLightColors.primary, [Validators.required, this.oklchValidator]],
    primaryForeground: [
      this.defaultLightColors.primaryForeground,
      [Validators.required, this.oklchValidator],
    ],
    secondary: [this.defaultLightColors.secondary, [Validators.required, this.oklchValidator]],
    accent: [this.defaultLightColors.accent, [Validators.required, this.oklchValidator]],
    ring: [this.defaultLightColors.ring, [Validators.required, this.oklchValidator]],
  });

  readonly darkForm = this.fb.group({
    primary: [this.defaultDarkColors.primary, [Validators.required, this.oklchValidator]],
    primaryForeground: [
      this.defaultDarkColors.primaryForeground,
      [Validators.required, this.oklchValidator],
    ],
    secondary: [this.defaultDarkColors.secondary, [Validators.required, this.oklchValidator]],
    accent: [this.defaultDarkColors.accent, [Validators.required, this.oklchValidator]],
    ring: [this.defaultDarkColors.ring, [Validators.required, this.oklchValidator]],
  });

  constructor() {
    // Load existing custom colors if available, otherwise load current theme colors
    const existingColors = this.themeService.getCustomColors();
    if (existingColors) {
      this.loadExistingColors(existingColors);
    } else {
      // Load current theme colors from the DOM
      this.loadCurrentThemeColors();
    }
  }

  ngAfterViewInit(): void {
    // Set initial tab based on current theme
    const initialIndex = this.themeService.currentTheme() === 'dark' ? 1 : 0;
    setTimeout(() => {
      const tabGroupComponent = this.tabGroup();
      if (tabGroupComponent) {
        tabGroupComponent.selectTabByIndex(initialIndex);
      }
    });
  }

  private loadExistingColors(colors: CustomThemeColors): void {
    if (colors.light['--primary']) {
      this.lightForm.patchValue({
        primary: colors.light['--primary'],
        primaryForeground: colors.light['--primary-foreground'],
        secondary: colors.light['--secondary'],
        accent: colors.light['--accent'],
        ring: colors.light['--ring'],
      });
    }

    if (colors.dark['--primary']) {
      this.darkForm.patchValue({
        primary: colors.dark['--primary'],
        primaryForeground: colors.dark['--primary-foreground'],
        secondary: colors.dark['--secondary'],
        accent: colors.dark['--accent'],
        ring: colors.dark['--ring'],
      });
    }
  }

  private loadCurrentThemeColors(): void {
    // Get computed styles from the document root
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    // Helper to get CSS variable value
    const getCSSVar = (varName: string): string => {
      const value = computedStyle.getPropertyValue(varName).trim();
      return value || this.defaultLightColors.primary; // Fallback to default
    };

    // Load current light theme colors (temporarily switch to light to get values)
    const currentTheme = this.themeService.currentTheme();

    // Get light theme colors
    if (currentTheme === 'dark') {
      root.classList.remove('dark');
    }

    const lightComputedStyle = getComputedStyle(root);
    const getLightVar = (varName: string): string => {
      return lightComputedStyle.getPropertyValue(varName).trim();
    };

    const lightPrimary = getLightVar('--primary');
    const lightPrimaryFg = getLightVar('--primary-foreground');
    const lightSecondary = getLightVar('--secondary');
    const lightAccent = getLightVar('--accent');
    const lightRing = getLightVar('--ring');

    // Get dark theme colors
    if (!root.classList.contains('dark')) {
      root.classList.add('dark');
    }

    const darkComputedStyle = getComputedStyle(root);
    const getDarkVar = (varName: string): string => {
      return darkComputedStyle.getPropertyValue(varName).trim();
    };

    const darkPrimary = getDarkVar('--primary');
    const darkPrimaryFg = getDarkVar('--primary-foreground');
    const darkSecondary = getDarkVar('--secondary');
    const darkAccent = getDarkVar('--accent');
    const darkRing = getDarkVar('--ring');

    // Restore original theme
    if (currentTheme === 'light') {
      root.classList.remove('dark');
    }

    // Update forms with current colors if they're valid OKLCH
    if (lightPrimary && this.isValidOklch(lightPrimary)) {
      this.lightForm.patchValue({
        primary: lightPrimary,
        primaryForeground: lightPrimaryFg || this.defaultLightColors.primaryForeground,
        secondary: lightSecondary || this.defaultLightColors.secondary,
        accent: lightAccent || this.defaultLightColors.accent,
        ring: lightRing || this.defaultLightColors.ring,
      });
    }

    if (darkPrimary && this.isValidOklch(darkPrimary)) {
      this.darkForm.patchValue({
        primary: darkPrimary,
        primaryForeground: darkPrimaryFg || this.defaultDarkColors.primaryForeground,
        secondary: darkSecondary || this.defaultDarkColors.secondary,
        accent: darkAccent || this.defaultDarkColors.accent,
        ring: darkRing || this.defaultDarkColors.ring,
      });
    }
  }

  private isValidOklch(value: string): boolean {
    const oklchPattern = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(\s*\/\s*[\d.]+)?\s*\)$/;
    return oklchPattern.test(value.trim());
  }

  /**
   * Convert hex color to OKLCH format
   */
  private hexToOklch(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Convert RGB to linear RGB
    const toLinear = (c: number) => {
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Convert linear RGB to XYZ (D65 illuminant)
    const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
    const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.072175;
    const z = rLinear * 0.0193339 + gLinear * 0.119192 + bLinear * 0.9503041;

    // Convert XYZ to Lab
    const xn = 0.95047;
    const yn = 1.0;
    const zn = 1.08883;

    const fx = x / xn > 0.008856 ? Math.pow(x / xn, 1 / 3) : 7.787 * (x / xn) + 16 / 116;
    const fy = y / yn > 0.008856 ? Math.pow(y / yn, 1 / 3) : 7.787 * (y / yn) + 16 / 116;
    const fz = z / zn > 0.008856 ? Math.pow(z / zn, 1 / 3) : 7.787 * (z / zn) + 16 / 116;

    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bVal = 200 * (fy - fz);

    // Convert Lab to LCH (which is similar to OKLCH)
    const C = Math.sqrt(a * a + bVal * bVal);
    let H = (Math.atan2(bVal, a) * 180) / Math.PI;
    if (H < 0) H += 360;

    // Normalize to OKLCH ranges
    const l = (L / 100).toFixed(2);
    const c = (C / 150).toFixed(2); // Approximate normalization
    const h = H.toFixed(0);

    return `oklch(${l} ${c} ${h})`;
  }

  /**
   * Handle custom color picker change
   */
  onColorPickCustom(hexColor: string, mode: 'light' | 'dark', field: string): void {
    const oklchColor = this.hexToOklch(hexColor);

    if (mode === 'light') {
      this.lightForm.patchValue({ [field]: oklchColor });
      this.lightForm.get(field)?.markAsDirty();
    } else {
      this.darkForm.patchValue({ [field]: oklchColor });
      this.darkForm.get(field)?.markAsDirty();
    }
  }

  /**
   * Convert OKLCH to approximate HEX for color picker display
   */
  oklchToHex(oklch: string): string {
    // Parse OKLCH
    const match = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (!match) return '#000000';

    const [, l, c, h] = match;
    const L = parseFloat(l) * 100;
    const C = parseFloat(c) * 150; // Approximate denormalization
    const H = parseFloat(h);

    // Convert LCH to Lab
    const a = C * Math.cos((H * Math.PI) / 180);
    const b = C * Math.sin((H * Math.PI) / 180);

    // Convert Lab to XYZ
    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    const xn = 0.95047;
    const yn = 1.0;
    const zn = 1.08883;

    const fx3 = fx * fx * fx;
    const fy3 = fy * fy * fy;
    const fz3 = fz * fz * fz;

    const x = xn * (fx3 > 0.008856 ? fx3 : (fx - 16 / 116) / 7.787);
    const y = yn * (fy3 > 0.008856 ? fy3 : (fy - 16 / 116) / 7.787);
    const z = zn * (fz3 > 0.008856 ? fz3 : (fz - 16 / 116) / 7.787);

    // Convert XYZ to linear RGB
    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    let g = x * -0.969266 + y * 1.8760108 + z * 0.041556;
    let bVal = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

    // Convert linear RGB to sRGB
    const toSRGB = (c: number) => {
      return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };

    r = Math.max(0, Math.min(1, toSRGB(r)));
    g = Math.max(0, Math.min(1, toSRGB(g)));
    bVal = Math.max(0, Math.min(1, toSRGB(bVal)));

    // Convert to hex
    const rHex = Math.round(r * 255)
      .toString(16)
      .padStart(2, '0');
    const gHex = Math.round(g * 255)
      .toString(16)
      .padStart(2, '0');
    const bHex = Math.round(bVal * 255)
      .toString(16)
      .padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }

  private oklchValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();
    if (!value) return { required: true };

    // OKLCH format: oklch(L C H) or oklch(L C H / A)
    const oklchPattern = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(\s*\/\s*[\d.]+)?\s*\)$/;
    const match = value.match(oklchPattern);

    if (!match) {
      return { invalidOklch: true };
    }

    const [, l, c, h] = match;
    const lightness = parseFloat(l);
    const chroma = parseFloat(c);
    const hue = parseFloat(h);

    // Validate ranges
    if (lightness < 0 || lightness > 1) {
      return { invalidLightness: true };
    }
    if (chroma < 0 || chroma > 0.4) {
      return { invalidChroma: true };
    }
    if (hue < 0 || hue > 360) {
      return { invalidHue: true };
    }

    return null;
  }

  save(): void {
    // Mark all as touched to show validation errors
    this.lightForm.markAllAsTouched();
    this.darkForm.markAllAsTouched();

    if (this.lightForm.invalid || this.darkForm.invalid) {
      this.toastService.error({
        title: 'Invalid Colors',
        message: 'Please check all color values are in valid OKLCH format',
      });
      return;
    }

    this.isSaving.set(true);

    const lightValues = this.lightForm.value;
    const darkValues = this.darkForm.value;

    const customColors: CustomThemeColors = {
      light: {
        '--primary': lightValues.primary!,
        '--primary-foreground': lightValues.primaryForeground!,
        '--secondary': lightValues.secondary!,
        '--secondary-foreground': lightValues.primary!,
        '--accent': lightValues.accent!,
        '--accent-foreground': lightValues.primary!,
        '--ring': lightValues.ring!,
        '--chart-1': lightValues.primary!,
        '--chart-2': this.deriveChartColor(lightValues.primary!, 120),
        '--chart-3': this.deriveChartColor(lightValues.primary!, 240),
        '--chart-4': lightValues.accent!,
        '--chart-5': lightValues.secondary!,
        '--sidebar-primary': lightValues.primary!,
        '--sidebar-accent': lightValues.secondary!,
        '--sidebar-ring': lightValues.ring!,
      },
      dark: {
        '--primary': darkValues.primary!,
        '--primary-foreground': darkValues.primaryForeground!,
        '--secondary': darkValues.secondary!,
        '--secondary-foreground': darkValues.primary!,
        '--accent': darkValues.accent!,
        '--accent-foreground': darkValues.primary!,
        '--ring': darkValues.ring!,
        '--chart-1': darkValues.primary!,
        '--chart-2': this.deriveChartColor(darkValues.primary!, 120),
        '--chart-3': this.deriveChartColor(darkValues.primary!, 240),
        '--chart-4': darkValues.accent!,
        '--chart-5': darkValues.secondary!,
        '--sidebar-primary': darkValues.primary!,
        '--sidebar-accent': darkValues.secondary!,
        '--sidebar-ring': darkValues.ring!,
      },
    };

    this.themeService.setCustomColors(customColors);

    this.toastService.success({
      title: 'Custom Theme Saved',
      message: 'Your custom colors have been applied successfully',
    });

    this.isSaving.set(false);
    this.dialogRef.close({ success: true });
  }

  private deriveChartColor(baseColor: string, hueShift: number): string {
    // Parse OKLCH color and shift hue for chart variations
    const match = baseColor.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (!match) return baseColor;

    const [, l, c, h] = match;
    const newHue = (parseFloat(h) + hueShift) % 360;
    return `oklch(${l} ${c} ${newHue})`;
  }

  resetAll(): void {
    this.lightForm.reset(this.defaultLightColors);
    this.darkForm.reset(this.defaultDarkColors);
    this.lightForm.markAsPristine();
    this.darkForm.markAsPristine();
    this.toastService.info({
      title: 'Reset to Defaults',
      message: 'All colors have been reset to default values',
    });
  }

  resetLightField(field: keyof typeof this.defaultLightColors): void {
    this.lightForm.patchValue({
      [field]: this.defaultLightColors[field],
    });
    this.lightForm.get(field)?.markAsDirty();
  }

  resetDarkField(field: keyof typeof this.defaultDarkColors): void {
    this.darkForm.patchValue({
      [field]: this.defaultDarkColors[field],
    });
    this.darkForm.get(field)?.markAsDirty();
  }

  close(): void {
    this.dialogRef.close();
  }
}
