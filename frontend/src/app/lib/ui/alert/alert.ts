import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { mergeClasses } from '@lib/utils/merge-classes';
import { IconName } from '@ng-icons/core';
import { IconComponent } from '@ui/icon';
import type { ClassValue } from 'clsx';
import { alertVariants, ZardAlertVariants } from './alert.variants';

@Component({
  selector: 'z-alert',
  standalone: true,
  imports: [IconComponent, RouterLink],
  exportAs: 'zAlert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (iconName()) {
    <hia-icon [name]="iconName()!" />
    }

    <div class="flex flex-col gap-1 w-full">
      <h5 class="font-medium leading-none tracking-tight mt-1">{{ zTitle() }}</h5>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm leading-relaxed">{{ zDescription() }}</span>
        @if (zActionLabel()) {
          <a
            class="text-sm underline font-medium hover:text-foreground"
            [routerLink]="zActionLink() ?? null"
            [queryParams]="zActionQueryParams() ?? null"
          >
            {{ zActionLabel() }}
          </a>
        }
      </div>
      <div class="mt-2">
        <ng-content />
      </div>
    </div>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-type]': 'zType()',
    '[attr.data-appearance]': 'zAppearance()',
  },
})
export class ZardAlertComponent {
  readonly class = input<ClassValue>('');
  readonly zTitle = input.required<string>();
  readonly zDescription = input.required<string>();
  readonly zIcon = input<IconName>();
  readonly zType = input<ZardAlertVariants['zType']>('default');
  readonly zAppearance = input<ZardAlertVariants['zAppearance']>('outline');
  readonly zActionLabel = input<string | undefined>(undefined);
  readonly zActionLink = input<string | any[] | undefined>(undefined);
  readonly zActionQueryParams = input<Record<string, any> | undefined>(undefined);

  protected readonly classes = computed(() =>
    mergeClasses(
      alertVariants({ zType: this.zType(), zAppearance: this.zAppearance() }),
      this.class()
    )
  );

  protected readonly iconsType: Record<NonNullable<ZardAlertVariants['zType']>, IconName | ''> = {
    default: '',
    info: 'lucideInfo',
    success: 'lucideCircleCheck',
    warning: 'lucideTriangleAlert',
    error: 'lucideCircleX',
  };

  protected readonly iconName = computed((): IconName | null => {
    const customIcon = this.zIcon();
    if (customIcon) return customIcon;

    const typeIcon = this.iconsType[this.zType() ?? 'default'];
    return typeIcon || null;
  });
}
