import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { mergeClasses } from '@lib/utils';
import type { ClassValue } from 'clsx';
import { IconComponent } from '../icon';
import { IconName } from '@core/config';

@Component({
  selector: 'hia-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      class="relative group"
      [class]="containerClasses()"
      (mouseenter)="onHover.emit($event)"
      (focus)="onHover.emit($event)"
      [attr.data-route]="route()"
    >
      @if (route()) {
      <a
        [routerLink]="route()"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: exact() }"
        [class]="linkClasses()"
        [attr.title]="collapsed() ? label() : null"
      >
        <div class="flex items-center gap-3 relative z-10">
          <div class="flex items-center justify-center w-5 h-5 shrink-0">
            <hia-icon [name]="icon()" [size]="iconSize()" class="transition-colors duration-200" />
          </div>
          @if (!collapsed()) {
          <span class="font-medium text-sm truncate transition-opacity duration-200">
            {{ label() }}
          </span>
          }
        </div>

        <!-- Active indicator -->
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full transition-all duration-200 opacity-0 -translate-x-2 group-[.active]:opacity-100 group-[.active]:translate-x-0"
        ></div>

        <!-- Hover background -->
        <div
          class="absolute inset-0 bg-accent/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
        ></div>
      </a>
      } @else {
      <button
        type="button"
        [class]="linkClasses()"
        [attr.title]="collapsed() ? label() : null"
        (click)="onClick.emit()"
      >
        <div class="flex items-center gap-3 relative z-10">
          <div class="flex items-center justify-center w-5 h-5 shrink-0">
            <hia-icon [name]="icon()" [size]="iconSize()" class="transition-colors duration-200" />
          </div>
          @if (!collapsed()) {
          <span class="font-medium text-sm truncate transition-opacity duration-200">
            {{ label() }}
          </span>
          }
        </div>

        <!-- Hover background -->
        <div
          class="absolute inset-0 bg-accent/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
        ></div>
      </button>
      }

      <!-- Badge -->
      @if (badge()) {
      <div
        class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center font-semibold shadow-sm"
      >
        {{ badge() }}
      </div>
      }

      <!-- Tooltip for collapsed state -->
      @if (collapsed()) {
      <div
        class="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
      >
        {{ label() }}
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45"
        ></div>
      </div>
      }
    </div>
  `,
})
export class NavItemComponent {
  private readonly elementRef = inject(ElementRef);

  readonly label = input.required<string>();
  readonly icon = input.required<IconName>();
  readonly route = input<string>();
  readonly collapsed = input<boolean>(false);
  readonly active = input<boolean>(false);
  readonly exact = input<boolean>(false);
  readonly badge = input<string | number>();
  readonly iconSize = input<number>(18);
  readonly class = input<ClassValue>('');

  readonly onClick = output<void>();
  readonly onHover = output<Event>();

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  protected readonly containerClasses = computed(() =>
    mergeClasses('relative z-10 group', this.class())
  );

  protected readonly linkClasses = computed(() =>
    mergeClasses(
      'relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      {
        'justify-center': this.collapsed(),
        'justify-start': !this.collapsed(),
        'text-foreground bg-accent/80 shadow-sm': this.active(),
      }
    )
  );
}
