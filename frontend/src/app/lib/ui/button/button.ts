import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { mergeClasses, transform } from '@lib/utils';
import type { ClassValue } from 'clsx';
import { IconComponent } from '../icon';
import { buttonVariants, ZardButtonVariants } from './button-variants';
import { IconName } from '@core/config';

@Component({
  selector: 'z-button, button[z-button], a[z-button]',
  exportAs: 'zButton',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      [type]="type()"
      class="inline-flex items-center justify-center gap-2"
      [disabled]="zLoading() || disabled()"
      [class]="classes()"
    >
      @if (zLoading()) {
      <hia-icon
        name="lucideLoaderCircle"
        [class]="'animate-spin ' + (iconClasses() || '')"
        [size]="iconSize()"
        [color]="iconColor()"
      />
      <span>Loading...</span>
      } @else { @if (iconPosition() === 'left' && iconName()) {
      <hia-icon
        [name]="iconName()"
        [family]="iconFamily()"
        [size]="iconSize()"
        [color]="iconColor()"
        [strokeWidth]="iconStrokeWidth()"
        [class]="iconClasses()"
      />
      }

      <span>{{ label() }}</span>

      @if (iconPosition() === 'right' && iconName()) {
      <hia-icon
        [name]="iconName()"
        [family]="iconFamily()"
        [size]="iconSize()"
        [color]="iconColor()"
        [strokeWidth]="iconStrokeWidth()"
        [class]="iconClasses()"
      />
      } }
    </button>
  `,
})
export class ZardButtonComponent {
  private readonly elementRef = inject(ElementRef);

  readonly zType = input<ZardButtonVariants['zType']>('default');
  readonly zSize = input<ZardButtonVariants['zSize']>('default');
  readonly zShape = input<ZardButtonVariants['zShape']>('default');
  readonly class = input<ClassValue>('');
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly zFull = input(false, { transform });
  readonly zLoading = input(false, { transform });
  readonly label = input<string>('');
  readonly iconName = input<IconName | string | undefined>();
  readonly iconFamily = input<'lucide' | 'mat' | 'tabler' | 'mat-outline' | 'svg'>('lucide');
  readonly iconPosition = input<'left' | 'right'>('left');
  readonly iconSize = input<number>(16);
  readonly iconColor = input<string>('currentColor');
  readonly iconStrokeWidth = input<number>(2);
  readonly iconAbsoluteStrokeWidth = input<boolean>(false);
  readonly iconClasses = input<string>('');
  readonly disabled = input(false, { transform });

  protected readonly classes = computed(() =>
    mergeClasses(
      buttonVariants({
        zType: this.zType(),
        zSize: this.zSize(),
        zShape: this.zShape(),
        zFull: this.zFull(),
        zLoading: this.zLoading(),
      }),
      this.class()
    )
  );
}
