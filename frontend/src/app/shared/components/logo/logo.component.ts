import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '@lib/utils/merge-classes';

@Component({
  selector: 'hia-logo',
  standalone: true,
  template: `
    <div [class]="containerClasses()">
      <svg
        [attr.width]="size()"
        [attr.height]="size()"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        [class]="logoClasses()"
      >
        <!-- Background circle -->
        <circle cx="20" cy="20" r="18" class="fill-primary" />

        <!-- Simple stacked boxes -->
        <rect x="13" y="23" width="14" height="5" rx="1" class="fill-white/90" />
        <rect x="13" y="17" width="14" height="5" rx="1" class="fill-white/95" />
        <rect x="13" y="11" width="14" height="5" rx="1" class="fill-white" />
      </svg>

      @if (showText()) {
      <div [class]="textClasses()">
        <span class="font-bold text-foreground">Inventory</span>
        <span class="text-muted-foreground">Hub</span>
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  readonly size = input<number>(40);
  readonly showText = input<boolean>(true);
  readonly variant = input<'default' | 'compact' | 'icon-only'>('default');
  readonly class = input<string>('');

  // Generate unique ID to avoid SVG conflicts when multiple logos are on the same page
  readonly componentId = Math.random().toString(36).substring(2, 11);

  readonly containerClasses = computed(() => {
    const variant = this.variant();
    const baseClasses = 'flex items-center';

    const variantClasses = {
      default: 'gap-3',
      compact: 'gap-2',
      'icon-only': 'justify-center',
    };

    return mergeClasses(baseClasses, variantClasses[variant], this.class());
  });

  readonly logoClasses = computed(() => {
    return mergeClasses('shrink-0 transition-transform hover:scale-105', 'drop-shadow-sm');
  });

  readonly textClasses = computed(() => {
    const variant = this.variant();

    const sizeClasses = {
      default: 'text-lg',
      compact: 'text-base',
      'icon-only': 'hidden',
    };

    return mergeClasses('flex flex-col leading-tight', sizeClasses[variant]);
  });
}
