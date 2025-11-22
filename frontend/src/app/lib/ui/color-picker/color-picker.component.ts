import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { mergeClasses } from '@lib/utils';

@Component({
  selector: 'z-color-picker',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <!-- Color Preview Button -->
      <button
        type="button"
        [class]="buttonClasses()"
        [style]="{
          width: size() + 'px',
          height: size() + 'px',
          backgroundColor: displayColor()
        }"
        (click)="togglePicker()"
        [attr.aria-label]="'Pick a color'"
        [attr.title]="hexColor()"
      >
        <div
          class="absolute inset-0 rounded-md border-2 border-border hover:border-primary transition-colors pointer-events-none"
        ></div>
      </button>

      <!-- Picker Dropdown -->
      @if (isOpen()) {
      <div
        class="absolute top-full left-0 mt-2 w-64 p-4 rounded-md border bg-popover shadow-lg z-50 animate-in fade-in-0 zoom-in-95"
        (click)="$event.stopPropagation()"
      >
        <div class="space-y-3">
          <!-- Saturation/Lightness Picker -->
          <div
            class="relative w-full h-40 rounded-lg overflow-hidden cursor-crosshair"
            #saturationBox
            (mousedown)="onSaturationMouseDown($event)"
          >
            <div
              class="absolute inset-0"
              [style.background]="'hsl(' + hue() + ', 100%, 50%)'"
            ></div>
            <div class="absolute inset-0 bg-linear-to-r from-white to-transparent"></div>
            <div class="absolute inset-0 bg-linear-to-t from-black to-transparent"></div>

            <!-- Cursor -->
            <div
              class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              [style.left.%]="saturation()"
              [style.top.%]="100 - lightness()"
            ></div>
          </div>

          <!-- Hue Slider -->
          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">Hue</label>
            <div
              class="relative w-full h-6 rounded-lg overflow-hidden cursor-pointer"
              #hueSlider
              (mousedown)="onHueMouseDown($event)"
            >
              <div
                class="absolute inset-0"
                style="background: linear-gradient(to right, 
                  hsl(0, 100%, 50%), 
                  hsl(60, 100%, 50%), 
                  hsl(120, 100%, 50%), 
                  hsl(180, 100%, 50%), 
                  hsl(240, 100%, 50%), 
                  hsl(300, 100%, 50%), 
                  hsl(360, 100%, 50%))"
              ></div>

              <!-- Cursor -->
              <div
                class="absolute top-0 bottom-0 w-1 bg-white border border-gray-800 shadow-lg pointer-events-none transform -translate-x-1/2"
                [style.left.%]="(hue() / 360) * 100"
              ></div>
            </div>
          </div>

          <!-- Color Preview & Hex Input -->
          <div class="flex items-center gap-2">
            <div
              class="w-12 h-12 rounded-md border-2 border-border shrink-0"
              [style.background]="displayColor()"
            ></div>
            <input
              type="text"
              [value]="hexColor()"
              (input)="onHexInput($event)"
              class="flex-1 px-3 py-2 text-sm font-mono rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class ZardColorPickerComponent {
  readonly value = input<string>('#000000');
  readonly size = input<number>(40);
  readonly disabled = input<boolean>(false);

  readonly valueChange = output<string>();

  private readonly saturationBox = viewChild<ElementRef>('saturationBox');
  private readonly hueSlider = viewChild<ElementRef>('hueSlider');

  // HSL values
  readonly hue = signal(0);
  readonly saturation = signal(100);
  readonly lightness = signal(50);
  readonly isOpen = signal(false);

  readonly displayColor = computed(() => {
    const h = this.hue();
    const s = this.saturation();
    const l = this.lightness();
    return `hsl(${h}, ${s}%, ${l}%)`;
  });

  readonly hexColor = computed(() => {
    return this.hslToHex(this.hue(), this.saturation(), this.lightness());
  });

  readonly buttonClasses = computed(() => {
    return mergeClasses(
      'relative rounded-md cursor-pointer transition-all duration-200 shrink-0',
      this.disabled() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
    );
  });

  private isDraggingSaturation = false;
  private isDraggingHue = false;

  constructor() {
    // Initialize from input value
    effect(
      () => {
        const color = this.value();
        if (color) {
          this.parseColor(color);
        }
      },
      { allowSignalWrites: true }
    );

    // Setup mouse move and up listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('mouseup', () => this.onMouseUp());
      window.addEventListener('click', (e) => this.onDocumentClick(e));
    }
  }

  togglePicker(): void {
    this.isOpen.update((v) => !v);
  }

  private onDocumentClick(event: MouseEvent): void {
    // Close picker when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('z-color-picker')) {
      this.isOpen.set(false);
    }
  }

  private parseColor(color: string): void {
    if (!color) {
      console.warn('Color picker: No color provided');
      return;
    }

    // Parse hex color
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');

      // Validate hex length
      if (hex.length !== 6) {
        console.warn('Color picker: Invalid hex color length:', color);
        return;
      }

      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (delta !== 0) {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

        if (max === r) {
          h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
          h = ((b - r) / delta + 2) / 6;
        } else {
          h = ((r - g) / delta + 4) / 6;
        }
      }

      const hueValue = Math.round(h * 360);
      const satValue = Math.round(s * 100);
      const lightValue = Math.round(l * 100);

      console.log('Color picker parsed:', { color, h: hueValue, s: satValue, l: lightValue });

      this.hue.set(hueValue);
      this.saturation.set(satValue);
      this.lightness.set(lightValue);
    } else {
      console.warn('Color picker: Unsupported color format:', color);
    }
  }

  onSaturationMouseDown(event: MouseEvent): void {
    if (this.disabled()) return;
    this.isDraggingSaturation = true;
    this.updateSaturationFromMouse(event);
  }

  onHueMouseDown(event: MouseEvent): void {
    if (this.disabled()) return;
    this.isDraggingHue = true;
    this.updateHueFromMouse(event);
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isDraggingSaturation) {
      this.updateSaturationFromMouse(event);
    } else if (this.isDraggingHue) {
      this.updateHueFromMouse(event);
    }
  }

  private onMouseUp(): void {
    this.isDraggingSaturation = false;
    this.isDraggingHue = false;
  }

  private updateSaturationFromMouse(event: MouseEvent): void {
    const box = this.saturationBox()?.nativeElement;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));

    const s = (x / rect.width) * 100;
    const l = 100 - (y / rect.height) * 100;

    this.saturation.set(Math.round(s));
    this.lightness.set(Math.round(l));
    this.emitColor();
  }

  private updateHueFromMouse(event: MouseEvent): void {
    const slider = this.hueSlider()?.nativeElement;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const h = (x / rect.width) * 360;

    this.hue.set(Math.round(h));
    this.emitColor();
  }

  onHexInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let hex = input.value.trim();

    // Add # if missing
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }

    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.parseColor(hex);
      this.emitColor();
    }
  }

  private emitColor(): void {
    this.valueChange.emit(this.hexColor());
  }

  private hslToHex(h: number, s: number, l: number): string {
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    const rHex = Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, '0');
    const gHex = Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, '0');
    const bHex = Math.round((b + m) * 255)
      .toString(16)
      .padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }
}
