import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { mergeClasses } from '@lib/utils';
import type { ClassValue } from 'clsx';
import { ZardStringTemplateOutletDirective } from '../core/directives/string-template-outlet/string-template-outlet';
import { IconComponent } from '../icon';
import { IconName } from '@core/config';
import { commonIcons } from '@core/config/icon.config';

export type ItemStatus = 'normal' | 'low-stock' | 'out-of-stock' | 'new' | 'updated';
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline';

export interface ListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: IconName;
  badge?: string | number;
  badgeVariant?: BadgeVariant;
  status?: ItemStatus;
  metadata?: Record<string, any>;
  tags?: string[];
  lastUpdated?: Date;
  isNew?: boolean;
}

@Component({
  selector: 'hia-item-list',
  standalone: true,
  imports: [IconComponent, ZardStringTemplateOutletDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [class]="containerClasses()">
      @for (item of items(); track item.id) {
      <div
        [class]="getItemClasses(item)"
        (click)="onItemClick.emit(item)"
        [attr.data-item-id]="item.id"
      >
        @if (itemTemplate()) {
        <ng-container *zStringTemplateOutlet="itemTemplate(); context: { $implicit: item }">
        </ng-container>
        } @else {
        <!-- Status indicator -->
        @if (item.status && item.status !== 'normal') {
        <div [class]="getStatusIndicatorClasses(item.status)"></div>
        }

        <div class="flex items-start gap-4 relative">
          <!-- Icon container with status-aware styling -->
          @if (item.icon) {
          <div [class]="getIconContainerClasses(item)">
            <hia-icon [name]="item.icon" [class]="getIconClasses(item)" />
            @if (item.isNew) {
            <div
              class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card animate-pulse"
            ></div>
            }
          </div>
          }

          <!-- Content area -->
          <div class="flex-1 min-w-0 space-y-2">
            <!-- Title and badges row -->
            <div class="flex items-center gap-2 flex-wrap">
              <h3 [class]="getTitleClasses(item)">{{ item.title }}</h3>
              @if (item.badge) {
              <span [class]="getBadgeClasses(item.badgeVariant || 'default')">{{
                item.badge
              }}</span>
              } @if (item.isNew) {
              <span [class]="getBadgeClasses('success')">New</span>
              }
            </div>

            <!-- Subtitle -->
            @if (item.subtitle) {
            <p class="text-sm text-muted-foreground truncate leading-relaxed">
              {{ item.subtitle }}
            </p>
            }

            <!-- Description -->
            @if (item.description) {
            <p class="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {{ item.description }}
            </p>
            }

            <!-- Last updated -->
            @if (isValidLastUpdated(item.lastUpdated)) {
            <div class="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <hia-icon [name]="commonIcons['history']" [size]="14" />
              <span>Updated {{ formatLastUpdated(item.lastUpdated) }}</span>
            </div>
            }

            <!-- Tags and metadata row -->
            @if (item.tags?.length || item.lastUpdated) {
            <div class="flex items-center justify-between gap-2 pt-1">
              <!-- Tags -->
              @if (item.tags?.length) {
              <div class="flex gap-1 flex-wrap">
                @for (tag of item.tags?.slice(0, 3) || []; track tag) {
                <span
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted/60 text-muted-foreground border border-border/40"
                >
                  {{ tag }}
                </span>
                } @if ((item.tags?.length || 0) > 3) {
                <span class="text-xs text-muted-foreground/60"
                  >+{{ (item.tags?.length || 0) - 3 }} more</span
                >
                }
              </div>
              }

              <!-- Metadata chips -->
              <div class="ml-auto flex items-center gap-1 flex-wrap">
                @if (item.metadata?.['quantity'] != null) {
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40"
                >
                  <hia-icon [name]="commonIcons['boxes']" [size]="14" />
                  <span
                    >{{ item.metadata?.['quantity']
                    }}{{ item.metadata?.['unit'] ? ' ' + (item.metadata?.['unit'] || '') : '' }}</span
                  >
                </span>
                } @if (item.metadata?.['room']) {
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40"
                >
                  <hia-icon [name]="commonIcons['warehouse']" [size]="14" />
                  <span>{{ item.metadata?.['room'] }}</span>
                </span>
                } @if (item.metadata?.['category']) {
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40"
                >
                  <hia-icon [name]="commonIcons['category']" [size]="14" />
                  <span>{{ item.metadata?.['category'] }}</span>
                </span>
                }
              </div>
            </div>
            }
          </div>

          <!-- Action indicator -->
          <div class="shrink-0 flex items-center">
            <hia-icon [name]="commonIcons['right']" [size]="16" class="text-muted-foreground/40" />
          </div>
        </div>
        }
      </div>
      } @empty { @if (emptyTemplate()) {
      <ng-container *zStringTemplateOutlet="emptyTemplate()"></ng-container>
      } @else {
      <div [class]="emptyStateClasses()">
        <div class="flex flex-col items-center justify-center py-16">
          <div [class]="emptyIconContainerClasses()">
            <hia-icon [name]="emptyIcon()" [size]="40" class="text-muted-foreground/30" />
          </div>
          <h3 class="font-semibold text-foreground mb-2 text-lg">{{ emptyMessage() }}</h3>
          <p class="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
            Items you add will appear here. Start by adding your first item to get organized.
          </p>
        </div>
      </div>
      } }
    </div>
  `,
})
export class ItemListComponent {
  readonly items = input.required<ListItem[]>();
  readonly itemTemplate = input<TemplateRef<{ $implicit: ListItem }>>();
  readonly emptyTemplate = input<TemplateRef<void>>();
  readonly emptyMessage = input<string>('No items found');
  readonly emptyIcon = input<IconName>('lucideInbox');
  readonly clickable = input<boolean>(true);
  readonly class = input<ClassValue>('');
  
  readonly commonIcons = commonIcons;

  readonly onItemClick = output<ListItem>();

  protected readonly containerClasses = computed(() => mergeClasses('space-y-3', this.class()));

  protected getItemClasses(item: ListItem): string {
    return mergeClasses(
      'group relative p-3 border rounded-2xl transition-colors duration-200 ease-out overflow-hidden',
      'bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm',
      // Status-based styling
      {
        'border-border/50': !item.status || item.status === 'normal',
        'border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-card/85 dark:border-orange-900/40 dark:from-orange-950/20':
          item.status === 'low-stock',
        'border-destructive/30 bg-gradient-to-br from-destructive/5 to-card/85':
          item.status === 'out-of-stock',
        'border-green-200/60 bg-gradient-to-br from-green-50/80 to-card/85 dark:border-green-900/40 dark:from-green-950/20':
          item.status === 'new',
      },
      // Interactive states
      {
        'cursor-pointer': this.clickable(),
        'cursor-default': !this.clickable(),
      }
    );
  }

  protected getStatusIndicatorClasses(status: ItemStatus): string {
    return mergeClasses('absolute top-0 left-0 w-1 h-full rounded-l-2xl', {
      'bg-orange-400': status === 'low-stock',
      'bg-destructive': status === 'out-of-stock',
      'bg-green-500': status === 'new',
      'bg-blue-500': status === 'updated',
    });
  }

  protected getIconContainerClasses(item: ListItem): string {
    return mergeClasses(
      'relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
      'border shadow-sm',
      // Status-based icon container styling
      {
        'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/15':
          !item.status || item.status === 'normal',
        'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200/60 dark:from-orange-900/30 dark:to-orange-950/20 dark:border-orange-800/40':
          item.status === 'low-stock',
        'bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/20':
          item.status === 'out-of-stock',
        'bg-gradient-to-br from-green-100 to-green-50 border-green-200/60 dark:from-green-900/30 dark:to-green-950/20 dark:border-green-800/40':
          item.status === 'new',
      }
    );
  }

  protected getIconClasses(item: ListItem): string {
    return mergeClasses({
      'text-primary': !item.status || item.status === 'normal',
      'text-orange-600 dark:text-orange-400': item.status === 'low-stock',
      'text-destructive': item.status === 'out-of-stock',
      'text-green-600 dark:text-green-400': item.status === 'new',
    });
  }

  protected getTitleClasses(item: ListItem): string {
    return mergeClasses('font-semibold truncate', {
      'text-foreground': !item.status || item.status === 'normal',
      'text-orange-900 dark:text-orange-100': item.status === 'low-stock',
      'text-destructive-foreground': item.status === 'out-of-stock',
      'text-green-900 dark:text-green-100': item.status === 'new',
    });
  }

  protected getBadgeClasses(variant: BadgeVariant): string {
    return mergeClasses(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      'border shadow-sm',
      {
        'bg-secondary/80 text-secondary-foreground border-border/40': variant === 'default',
        'bg-muted/80 text-muted-foreground border-border/40': variant === 'secondary',
        'bg-green-100 text-green-800 border-green-200/60 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/40':
          variant === 'success',
        'bg-orange-100 text-orange-800 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40':
          variant === 'warning',
        'bg-destructive/10 text-destructive border-destructive/20': variant === 'destructive',
        'bg-transparent text-foreground border-border': variant === 'outline',
      }
    );
  }

  protected readonly emptyStateClasses = computed(() =>
    mergeClasses(
      'border-2 border-dashed border-border/30 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/10'
    )
  );

  protected readonly emptyIconContainerClasses = computed(() =>
    mergeClasses(
      'rounded-full bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center mb-6',
      'border border-border/20 shadow-sm'
    )
  );

  protected isValidLastUpdated(value: unknown): boolean {
    const d = this.parseDate(value);
    return !!d && !isNaN(d.getTime());
  }

  protected formatLastUpdated(value: unknown): string {
    const date = this.parseDate(value);
    if (!date || isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';

    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }

  private parseDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }
}
