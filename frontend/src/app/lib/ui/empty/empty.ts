import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import type { ClassValue } from 'clsx';

import { emptyVariants, ZardEmptyVariants } from './empty.variants';
import { mergeClasses } from '@lib/utils/merge-classes';
import { ZardStringTemplateOutletDirective } from '@ui/core';
import { IconComponent } from '@ui/icon';
import { IconName } from '@core/config';

@Component({
  selector: 'z-empty',
  exportAs: 'zEmpty',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZardStringTemplateOutletDirective, IconComponent],
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (zImage()) { @if (isTemplate(zImage())) {
    <div class="flex justify-center items-center">
      <ng-container *zStringTemplateOutlet="zImage()"></ng-container>
    </div>
    } @else {
    <img [src]="zImage()" alt="Empty" class="mx-auto" />
    } } @else {
    <div class="flex justify-center items-center">
      <hia-icon [name]="zIcon()" [size]="zIconSize()" />
    </div>
    } @if (zDescription()) {
    <div class="mt-2">
      @if (isTemplate(zDescription())) {
      <ng-container *zStringTemplateOutlet="zDescription()"></ng-container>
      } @else {
      <p>{{ zDescription() }}</p>
      }
    </div>
    }
  `,
})
export class ZardEmptyComponent {
  readonly zImage = input<string | TemplateRef<unknown>>();
  readonly zDescription = input<string | TemplateRef<unknown>>('No data');
  readonly zSize = input<ZardEmptyVariants['zSize']>('default');
  readonly zIcon = input<IconName>('lucideBox');
  readonly zIconSize = input<number>(18);
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() =>
    mergeClasses(emptyVariants({ zSize: this.zSize() }), this.class())
  );

  isTemplate(value: string | TemplateRef<unknown> | undefined): value is TemplateRef<unknown> {
    return value instanceof TemplateRef;
  }
}
