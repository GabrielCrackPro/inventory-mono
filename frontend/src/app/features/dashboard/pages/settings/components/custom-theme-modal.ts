import { Component, inject, signal, computed } from '@angular/core';
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="lightForm.get('primary')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="
                        lightForm.get('primaryForeground')?.value || 'transparent'
                      "
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="lightForm.get('secondary')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="lightForm.get('accent')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="lightForm.get('ring')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="darkForm.get('primary')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="darkForm.get('primaryForeground')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="darkForm.get('secondary')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="darkForm.get('accent')?.value || 'transparent'"
                    ></div>
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
                    <div
                      class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                      [style.background]="darkForm.get('ring')?.value || 'transparent'"
                    ></div>
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

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div class="font-medium text-foreground mb-1">Common Hues</div>
            <div class="space-y-0.5 text-muted-foreground">
              <div>Red: 0-30</div>
              <div>Orange: 30-60</div>
              <div>Yellow: 60-90</div>
              <div>Green: 90-180</div>
              <div>Blue: 180-270</div>
              <div>Purple: 270-330</div>
            </div>
          </div>
          <div class="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div class="font-medium text-foreground mb-1">Tips</div>
            <div class="space-y-0.5 text-muted-foreground">
              <div>• Higher L = lighter</div>
              <div>• Higher C = more vibrant</div>
              <div>• Keep C under 0.3 for UI</div>
              <div>• Use similar L for harmony</div>
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
  `,
})
export class CustomThemeModalComponent {
  private readonly dialogRef = inject(ZardDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);

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
    // Load existing custom colors if available
    const existingColors = this.themeService.getCustomColors();
    if (existingColors) {
      this.loadExistingColors(existingColors);
    }
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
