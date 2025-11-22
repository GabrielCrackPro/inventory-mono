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
import { CommonModule, TitleCasePipe } from '@angular/common';
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
  imports: [IconComponent, ZardStringTemplateOutletDirective, TitleCasePipe],
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

        <div class="flex items-start gap-3 relative">
          <!-- Icon container with status-aware styling -->
          @if (item.icon) {
          <div [class]="getIconContainerClasses(item)">
            <hia-icon [name]="item.icon" [class]="getIconClasses(item)" [size]="20" />
            @if (item.isNew) {
            <div
              class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card animate-pulse"
            ></div>
            }
          </div>
          }

          <!-- Content area -->
          <div class="flex-1 min-w-0 space-y-1.5">
            <!-- Title and badges row -->
            <div class="flex items-center gap-2 flex-wrap">
              <h3 [class]="getTitleClasses(item)">
                {{ item.title }}
              </h3>
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
            <p class="text-xs text-muted-foreground line-clamp-1">
              {{ item.description }}
            </p>
            }

            <!-- Tags and metadata -->
            @if (item.tags?.length || item.metadata) {
            <div class="pt-1 space-y-1.5">
              <!-- Tags -->
              @if (item.tags?.length) {
              <div class="flex gap-1.5 flex-wrap">
                @for (tag of item.tags?.slice(0, 2) || []; track tag) {
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                >
                  {{ tag }}
                </span>
                } @if ((item.tags?.length || 0) > 2) {
                <span class="text-[10px] text-muted-foreground/60 self-center"
                  >+{{ (item.tags?.length || 0) - 2 }}</span
                >
                }
              </div>
              }

              <!-- Metadata chips - flexible layout -->
              <div class="flex flex-wrap gap-2">
                @if (item.metadata?.['quantity'] != null) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary/80 text-secondary-foreground border border-border/30 shadow-sm"
                >
                  <hia-icon [name]="commonIcons['boxes']" [size]="12" />
                  <span
                    >{{ item.metadata?.['quantity']







                    }}{{ item.metadata?.['unit'] ? ' ' + (item.metadata?.['unit'] || '') : '' }}</span
                  >
                </span>
                } @if (item.metadata?.['room']) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm [background:color-mix(in_srgb,var(--chart-1)_15%,transparent)] text-chart-1 border-[color-mix(in_srgb,var(--chart-1)_30%,transparent)] border"
                >
                  <hia-icon [name]="commonIcons['room']" [size]="12" />
                  <span>{{ item.metadata?.['room']?.name || item.metadata?.['room'] }}</span>
                </span>
                } @if (item.metadata?.['category']) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm [background:color-mix(in_srgb,var(--chart-4)_15%,transparent)] text-chart-4 border-[color-mix(in_srgb,var(--chart-4)_30%,transparent)] border"
                >
                  <hia-icon [name]="commonIcons['category']" [size]="12" />
                  <span
                    >{{ (item.metadata?.['category']?.name || item.metadata?.['category']) | titlecase }}</span
                  >
                </span>
                }
              </div>
            </div>
            }
          </div>

          <!-- Action indicator -->
          <div class="shrink-0 flex items-center">
            <hia-icon
              [name]="commonIcons['right']"
              [size]="18"
              class="text-muted-foreground/40 group-hover:text-primary transition-colors"
            />
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

  protected readonly containerClasses = computed(() => mergeClasses('space-y-4', this.class()));

  protected getItemClasses(item: ListItem): string {
    return mergeClasses(
      'group relative p-4 border rounded-lg transition-all duration-200',
      'bg-card',
      'hover:shadow-md hover:border-border',
      // Status-based styling
      {
        'border-border/60': !item.status || item.status === 'normal',
        '[border-color:color-mix(in_srgb,var(--chart-3)_40%,transparent)] [background:color-mix(in_srgb,var(--chart-3)_5%,transparent)]':
          item.status === 'low-stock',
        'border-destructive/50 bg-destructive/5': item.status === 'out-of-stock',
        '[border-color:color-mix(in_srgb,var(--chart-2)_40%,transparent)] [background:color-mix(in_srgb,var(--chart-2)_5%,transparent)]':
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
      '[background:var(--chart-3)]': status === 'low-stock',
      'bg-destructive': status === 'out-of-stock',
      '[background:var(--chart-2)]': status === 'new',
      '[background:var(--chart-1)]': status === 'updated',
    });
  }

  protected getIconContainerClasses(item: ListItem): string {
    return mergeClasses(
      'relative w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
      'border',
      // Status-based icon container styling
      {
        'bg-primary/10 border-primary/20': !item.status || item.status === 'normal',
        '[background:color-mix(in_srgb,var(--chart-3)_15%,transparent)] [border-color:color-mix(in_srgb,var(--chart-3)_30%,transparent)]':
          item.status === 'low-stock',
        'bg-destructive/10 border-destructive/20': item.status === 'out-of-stock',
        '[background:color-mix(in_srgb,var(--chart-2)_15%,transparent)] [border-color:color-mix(in_srgb,var(--chart-2)_30%,transparent)]':
          item.status === 'new',
      }
    );
  }

  protected getIconClasses(item: ListItem): string {
    return mergeClasses({
      'text-primary': !item.status || item.status === 'normal',
      '[color:var(--chart-3)]': item.status === 'low-stock',
      'text-destructive': item.status === 'out-of-stock',
      '[color:var(--chart-2)]': item.status === 'new',
    });
  }

  protected getTitleClasses(item: ListItem): string {
    return mergeClasses('font-semibold truncate', {
      'text-foreground': !item.status || item.status === 'normal',
      '[color:var(--chart-3)]': item.status === 'low-stock',
      'text-destructive': item.status === 'out-of-stock',
      '[color:var(--chart-2)]': item.status === 'new',
    });
  }

  protected getBadgeClasses(variant: BadgeVariant): string {
    return mergeClasses(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      'border shadow-sm',
      {
        'bg-secondary/80 text-secondary-foreground border-border/40': variant === 'default',
        'bg-muted/80 text-muted-foreground border-border/40': variant === 'secondary',
        '[background:color-mix(in_srgb,var(--chart-2)_15%,transparent)] [color:var(--chart-2)] [border-color:color-mix(in_srgb,var(--chart-2)_30%,transparent)]':
          variant === 'success',
        '[background:color-mix(in_srgb,var(--chart-3)_15%,transparent)] [color:var(--chart-3)] [border-color:color-mix(in_srgb,var(--chart-3)_30%,transparent)]':
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
