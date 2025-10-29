import {
  ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { IconName } from '@core/config';
import { mergeClasses } from '@lib/utils';
import { IconComponent } from '@ui/icon';
import type { ClassValue } from 'clsx';

type IconPosition = 'left' | 'right';

@Directive({
  selector: 'button[hia-icon], input[hia-icon]',
  standalone: true,
  exportAs: 'hiaIcon',
  host: {
    '[class]': 'classes()',
  },
})
export class IconDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly vcr = inject(ViewContainerRef);

  readonly iconName = input<IconName>();
  readonly iconPosition = input<IconPosition>('left');
  readonly iconSize = input<number>(16);
  readonly iconColor = input<string>('currentColor');
  readonly iconStrokeWidth = input<number>(2);
  readonly iconAbsoluteStrokeWidth = input<boolean>(false);
  readonly iconClass = input<ClassValue>('');

  private iconRef?: ComponentRef<IconComponent>;

  protected readonly classes = computed(() => {
    const base = 'relative flex items-center';
    const spacing = this.iconName() ? (this.iconPosition() === 'left' ? 'pl-8' : 'pr-8') : '';
    return mergeClasses(base, spacing, this.iconClass());
  });

  constructor() {
    effect(() => {
      this.renderIcon();
    });
  }

  private renderIcon(): void {
    const host = this.el.nativeElement;

    if (!this.iconName()) {
      this.destroyIcon();
      return;
    }

    // Create icon component if not already present
    if (!this.iconRef) {
      this.iconRef = this.vcr.createComponent(IconComponent);
      const iconEl = this.iconRef.location.nativeElement;

      this.renderer.setStyle(iconEl, 'position', 'absolute');
      this.renderer.setStyle(iconEl, this.iconPosition() === 'left' ? 'left' : 'right', '8px');
      this.renderer.setStyle(iconEl, 'top', '50%');
      this.renderer.setStyle(iconEl, 'transform', 'translateY(-50%)');
      this.renderer.setStyle(iconEl, 'pointer-events', 'none');

      this.renderer.appendChild(host, iconEl);
    }

    // Update icon properties reactively
    const icon = this.iconRef.instance;
    if (icon) {
      icon.name = this.iconName;
      icon.size = this.iconSize;
      icon.color = this.iconColor;
      icon.strokeWidth = this.iconStrokeWidth;
      icon.absoluteStrokeWidth = this.iconAbsoluteStrokeWidth;
    }
  }

  private destroyIcon(): void {
    if (this.iconRef) {
      this.iconRef.destroy();
      this.iconRef = undefined;
    }
  }
}
