import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  runInInjectionContext,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { debounceTime, fromEvent, merge, map, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import {
  tabButtonVariants,
  tabContainerVariants,
  tabNavVariants,
  ZardTabVariants,
} from './tabs.variants';
import { ZardButtonComponent } from '@ui/button';
import { IconComponent } from '@ui/icon';

export type zPosition = 'top' | 'bottom' | 'left' | 'right';
export type zAlign = 'center' | 'start' | 'end';

@Component({
  selector: 'z-tab',
  standalone: true,
  imports: [],
  template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class ZardTabComponent {
  label = input.required<string>();
  readonly contentTemplate = viewChild.required<TemplateRef<unknown>>('content');
}

@Component({
  selector: 'z-tab-group',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, IconComponent],
  host: { '[class]': 'containerClasses()' },
  animations: [
    trigger('tabContent', [
      state(
        'active',
        style({
          opacity: 1,
          transform: 'translateX(0) scale(1)',
          visibility: 'visible',
        })
      ),
      state(
        'inactive',
        style({
          opacity: 0,
          transform: 'translateY(10px) scale(0.95)',
          visibility: 'hidden',
        })
      ),
      state(
        'inactive-left',
        style({
          opacity: 0,
          transform: 'translateX(-30px) scale(0.95)',
          visibility: 'hidden',
        })
      ),
      state(
        'inactive-right',
        style({
          opacity: 0,
          transform: 'translateX(30px) scale(0.95)',
          visibility: 'hidden',
        })
      ),
      transition('* => active', [
        style({ visibility: 'visible' }),
        animate(
          '350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 1,
            transform: 'translateX(0) scale(1)',
          })
        ),
      ]),
      transition('active => inactive-left', [
        animate(
          '250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 0,
            transform: 'translateX(-30px) scale(0.95)',
          })
        ),
        style({ visibility: 'hidden' }),
      ]),
      transition('active => inactive-right', [
        animate(
          '250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 0,
            transform: 'translateX(30px) scale(0.95)',
          })
        ),
        style({ visibility: 'hidden' }),
      ]),
      transition('active => inactive', [
        animate(
          '250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 0,
            transform: 'translateY(10px) scale(0.95)',
          })
        ),
        style({ visibility: 'hidden' }),
      ]),
    ]),
    trigger('tabButton', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
    trigger('staggerTabs', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-10px)' }),
            stagger(50, [
              animate(
                '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                style({
                  opacity: 1,
                  transform: 'translateY(0)',
                })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  template: `
    @if (navBeforeContent()) {
    <ng-container [ngTemplateOutlet]="navigationBlock"></ng-container>
    }

    <div class="tab-content flex-1 relative">
      @for (tab of tabs(); track $index; let index = $index) {
      <div
        role="tabpanel"
        [attr.id]="'tabpanel-' + index"
        [attr.aria-labelledby]="'tab-' + index"
        [attr.tabindex]="0"
        [@tabContent]="getTabAnimationState()(index)"
        class="outline-none focus-visible:ring-2 focus-visible:ring-primary/50 absolute inset-0 w-full"
        [class.relative]="activeTabIndex() === index"
        [class.absolute]="activeTabIndex() !== index"
      >
        <ng-container [ngTemplateOutlet]="tab.contentTemplate()"></ng-container>
      </div>
      }
    </div>

    @if (!navBeforeContent()) {
    <ng-container [ngTemplateOutlet]="navigationBlock"></ng-container>
    }

    <ng-template #navigationBlock>
      @let horizontal = isHorizontal();

      <div [class]="navGridClasses()">
        @if (showArrow()) { @if (horizontal) {
        <button
          class="scroll-btn scroll-left pr-4 cursor-pointer"
          [class]="zTabsPosition() === 'top' ? 'mb-4' : 'mt-4'"
          (click)="scrollNav('left')"
        >
          <hia-icon name="lucideChevronLeft" [size]="16" />
        </button>
        } @else {
        <button
          class="scroll-btn scroll-up pb-4 cursor-pointer"
          [class]="zTabsPosition() === 'left' ? 'mr-4' : 'ml-4'"
          (click)="scrollNav('up')"
        >
          <hia-icon name="lucideChevronUp" [size]="16" />
        </button>
        } }

        <nav
          [ngClass]="navClasses()"
          #tabNav
          role="tablist"
          [attr.aria-orientation]="horizontal ? 'horizontal' : 'vertical'"
          [@staggerTabs]="tabs().length"
        >
          @for (tab of tabs(); track $index; let index = $index) {
          <z-button
            zType="text"
            [label]="tab.label()"
            role="tab"
            [attr.id]="'tab-' + index"
            [attr.aria-selected]="activeTabIndex() === index"
            [attr.tabindex]="activeTabIndex() === index ? 0 : -1"
            [attr.aria-controls]="'tabpanel-' + index"
            (click)="setActiveTab(index)"
            [class]="buttonClassesSignal()[index] + ' transition-all duration-200 ease-in-out'"
            [@tabButton]
          />
          }
        </nav>

        @if (showArrow()) { @if (horizontal) {
        <button
          class="scroll-btn scroll-right pl-4 cursor-pointer"
          [class]="zTabsPosition() === 'top' ? 'mb-4' : 'mt-4'"
          (click)="scrollNav('right')"
        >
          <hia-icon name="lucideChevronRight" [size]="16" />
        </button>
        } @else {
        <button
          class="scroll-btn scroll-down pt-4 cursor-pointer"
          [class]="zTabsPosition() === 'left' ? 'mr-4' : 'ml-4'"
          (click)="scrollNav('down')"
        >
          <hia-icon name="lucideChevronDown" [size]="16" />
        </button>
        } }
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .nav-tab-scroll {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        &::-webkit-scrollbar-thumb {
          background-color: rgba(209, 209, 209, 0.2);
          border-radius: 2px;
        }
        &::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        &::-webkit-scrollbar-button {
          display: none;
        }
      }

      .tab-content {
        overflow: hidden;
      }

      .scroll-btn {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0.6;
      }

      .scroll-btn:hover {
        opacity: 1;
        transform: scale(1.05);
      }

      .scroll-btn:active {
        transform: scale(0.95);
      }
    `,
  ],
})
export class ZardTabGroupComponent implements AfterViewInit {
  private readonly tabComponents = contentChildren(ZardTabComponent, { descendants: true });
  private readonly tabsContainer = viewChild.required<ElementRef>('tabNav');
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly tabs = computed(() => this.tabComponents());
  protected readonly activeTabIndex = signal<number>(0);
  protected readonly previousTabIndex = signal<number>(0);
  protected readonly scrollPresent = signal<boolean>(false);

  protected readonly getTabAnimationState = computed(() => {
    const activeIndex = this.activeTabIndex();
    const previousIndex = this.previousTabIndex();

    return (tabIndex: number) => {
      if (tabIndex === activeIndex) {
        return 'active';
      }

      // Determine direction based on tab navigation
      if (tabIndex === previousIndex) {
        return tabIndex < activeIndex ? 'inactive-left' : 'inactive-right';
      }

      return 'inactive';
    };
  });

  protected readonly zOnTabChange = output<{
    index: number;
    label: string;
    tab: ZardTabComponent;
  }>();
  protected readonly zDeselect = output<{
    index: number;
    label: string;
    tab: ZardTabComponent;
  }>();

  public readonly zTabsPosition = input<ZardTabVariants['zPosition']>('top');
  public readonly zActivePosition = input<ZardTabVariants['zActivePosition']>('bottom');
  public readonly zShowArrow = input(true);
  public readonly zScrollAmount = input(100);
  public readonly zAlignTabs = input<zAlign>('start');
  // Preserve consumer classes on host
  public readonly class = input<string>('');

  protected readonly showArrow = computed(() => this.zShowArrow() && this.scrollPresent());

  ngAfterViewInit(): void {
    // default tab selection
    if (this.tabs().length) {
      this.setActiveTab(0);
    }

    runInInjectionContext(this.injector, () => {
      const observeInputs$ = merge(
        toObservable(this.zShowArrow),
        toObservable(this.tabs),
        toObservable(this.zTabsPosition)
      );

      // Re-observe whenever #tabNav reference changes (e.g., when placement toggles)
      let observedEl: HTMLElement | null = null;
      const tabNavEl$ = toObservable(this.tabsContainer).pipe(
        map((ref) => ref.nativeElement as HTMLElement),
        distinctUntilChanged()
      );

      afterNextRender(() => {
        // SSR/browser guard
        if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;

        const resizeObserver = new ResizeObserver(() => this.setScrollState());

        tabNavEl$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((el) => {
          if (observedEl) resizeObserver.unobserve(observedEl);
          observedEl = el;
          resizeObserver.observe(el);
          this.setScrollState();
        });

        merge(observeInputs$, fromEvent(window, 'resize'))
          .pipe(debounceTime(10), takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.setScrollState());

        this.destroyRef.onDestroy(() => resizeObserver.disconnect());
      });
    });
  }

  private setScrollState(): void {
    if (this.hasScroll() !== this.scrollPresent()) {
      this.scrollPresent.set(this.hasScroll());
    }
  }

  private hasScroll(): boolean {
    const navElement: HTMLElement = this.tabsContainer().nativeElement;
    if (this.zShowArrow()) {
      return (
        navElement.scrollWidth > navElement.clientWidth ||
        navElement.scrollHeight > navElement.clientHeight
      );
    }
    return false;
  }

  protected setActiveTab(index: number) {
    const currentTab = this.tabs()[this.activeTabIndex()];
    if (index !== this.activeTabIndex()) {
      this.zDeselect.emit({
        index: this.activeTabIndex(),
        label: currentTab.label(),
        tab: currentTab,
      });
    }

    this.previousTabIndex.set(this.activeTabIndex());
    this.activeTabIndex.set(index);
    const activeTabComponent = this.tabs()[index];
    if (activeTabComponent) {
      this.zOnTabChange.emit({
        index,
        label: activeTabComponent.label(),
        tab: activeTabComponent,
      });
    }
  }

  protected readonly navBeforeContent = computed(() => {
    const position = this.zTabsPosition();
    return position === 'top' || position === 'left';
  });

  protected readonly isHorizontal = computed(() => {
    const position = this.zTabsPosition();
    return position === 'top' || position === 'bottom';
  });

  protected readonly navGridClasses = computed(() => {
    const gridLayout = this.isHorizontal()
      ? 'grid-cols-[25px_1fr_25px]'
      : 'grid-rows-[25px_1fr_25px]';
    if (this.showArrow()) {
      return twMerge(clsx('grid', gridLayout));
    }
    return 'grid';
  });

  protected readonly containerClasses = computed(() =>
    twMerge(tabContainerVariants({ zPosition: this.zTabsPosition() }), this.class())
  );

  protected readonly navClasses = computed(() =>
    tabNavVariants({
      zPosition: this.zTabsPosition(),
      zAlignTabs: this.showArrow() ? 'start' : this.zAlignTabs(),
    })
  );

  protected readonly buttonClassesSignal = computed(() => {
    const activeIndex = this.activeTabIndex();
    const position = this.zActivePosition();
    return this.tabs().map((_, index) => {
      const isActive = activeIndex === index;
      return tabButtonVariants({ zActivePosition: position, isActive });
    });
  });

  protected scrollNav(direction: 'left' | 'right' | 'up' | 'down') {
    const container = this.tabsContainer().nativeElement;
    const scrollAmount = this.zScrollAmount();
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else if (direction === 'right') {
      container.scrollLeft += scrollAmount;
    } else if (direction === 'up') {
      container.scrollTop -= scrollAmount;
    } else if (direction === 'down') {
      container.scrollTop += scrollAmount;
    }
  }

  public selectTabByIndex(index: number): void {
    if (index >= 0 && index < this.tabs().length) {
      this.setActiveTab(index);
    } else {
      console.warn(`Index ${index} outside the range of available tabs.`);
    }
  }
}
