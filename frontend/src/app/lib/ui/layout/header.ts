import type { ClassValue } from 'clsx';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { mergeClasses } from '@lib/utils/merge-classes';
import { headerVariants, HeaderVariants } from './layout-variants';

@Component({
  selector: 'z-header',
  exportAs: 'zHeader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <header [class]="classes()" [style.height.px]="zHeight()" role="banner">
      <ng-content></ng-content>
    </header>
  `,
})
export class ZHeaderComponent {
  readonly class = input<ClassValue>('');
  readonly zHeight = input<number>(64);
  readonly zPadding = input<HeaderVariants['zPadding']>('md');
  readonly zShadow = input<HeaderVariants['zShadow']>('none');
  readonly zDetectScroll = input<boolean>(false);

  protected readonly isScrolled = signal(false);

  protected readonly classes = computed(() =>
    mergeClasses(
      headerVariants({
        zPadding: this.zPadding(),
        zShadow: this.zShadow(),
        zScrolled: this.isScrolled(),
      }),
      this.class()
    )
  );

  constructor() {
    // Initialize scroll detection if enabled
    effect(() => {
      if (this.zDetectScroll()) {
        this._checkScroll();
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.zDetectScroll()) {
      this._checkScroll();
    }
  }

  private _checkScroll(): void {
    const scrolled = window.scrollY > 10;
    if (this.isScrolled() !== scrolled) {
      this.isScrolled.set(scrolled);
    }
  }
}
