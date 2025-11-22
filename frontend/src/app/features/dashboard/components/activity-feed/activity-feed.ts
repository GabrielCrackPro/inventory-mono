import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { IconName, commonIcons } from '@core/config';
import { ActivityItem } from '@features/item';
import { ActivityType, UserActivity } from '@shared/models';
import { ZardButtonComponent } from '@ui/button';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { formatRelativeTime, formatDateForGrouping } from '@lib/utils/time';

interface EnhancedActivityItem extends ActivityItem {
  type: ActivityType;
  user?: string;
  color: string;
  bgColor: string;
  date: string;
}

interface ActivityGroup {
  date: string;
  activities: EnhancedActivityItem[];
}

@Component({
  selector: 'hia-activity-feed',
  imports: [ZardButtonComponent, ZardCardComponent, IconComponent],
  templateUrl: './activity-feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeed {
  readonly activities = input<UserActivity[]>([]);
  readonly loading = input<boolean>(false);
  readonly refresh = output<void>();
  readonly commonIcons = commonIcons;
  readonly activityClick = output<EnhancedActivityItem>();
  readonly viewAllActivities = output<void>();

  private readonly _enhancedActivities = signal<EnhancedActivityItem[]>([]);
  private readonly _refreshing = signal<boolean>(false);
  private readonly _expanded = signal<boolean>(false);

  private readonly DEFAULT_VISIBLE_ACTIVITIES = 5;

  readonly groupedActivities = computed(() =>
    this._groupActivitiesByDate(this.visibleActivities())
  );
  readonly hasActivities = computed(() => this._enhancedActivities().length > 0);
  readonly totalActivitiesCount = computed(() => this._enhancedActivities().length);
  readonly isRefreshing = computed(() => this._refreshing());
  readonly isLoading = computed(() => this.loading() || this._refreshing());
  readonly isExpanded = computed(() => this._expanded());
  readonly visibleActivities = computed(() => {
    const allActivities = this._enhancedActivities();
    return this._expanded()
      ? allActivities
      : allActivities.slice(0, this.DEFAULT_VISIBLE_ACTIVITIES);
  });
  readonly hasMoreActivities = computed(
    () => this._enhancedActivities().length > this.DEFAULT_VISIBLE_ACTIVITIES
  );
  readonly hiddenActivitiesCount = computed(() =>
    Math.max(0, this._enhancedActivities().length - this.DEFAULT_VISIBLE_ACTIVITIES)
  );

  get defaultVisibleActivities() {
    return this.DEFAULT_VISIBLE_ACTIVITIES;
  }

  constructor() {
    effect(() => {
      this._enhancedActivities.set(this._mapActivitiesToEnhancedItems(this.activities()));
    });
  }

  refreshActivities() {
    this._refreshing.set(true);
    this.refresh.emit();

    setTimeout(() => {
      this._refreshing.set(false);
    }, 1000);
  }

  onActivityClick(activity: EnhancedActivityItem) {
    this.activityClick.emit(activity);
  }

  toggleExpanded() {
    this._expanded.set(!this._expanded());
  }

  onViewAllActivities() {
    this.viewAllActivities.emit();
  }

  private _mapActivitiesToEnhancedItems(activities: UserActivity[]): EnhancedActivityItem[] {
    if (!Array.isArray(activities)) return [];

    return activities.map((activity) => ({
      id: activity.id,
      title: activity.name || 'Activity',
      description: activity.description,
      time: this._formatRelativeTime(activity.createdAt),
      icon: this._getActivityIcon(activity.type),
      type: activity.type,
      user: activity.user?.name || 'Unknown User',
      color: this._getActivityColor(activity.type),
      bgColor: this._getActivityBgColor(activity.type),
      date: this._formatDate(activity.createdAt),
    }));
  }

  private _groupActivitiesByDate(activities: EnhancedActivityItem[]): ActivityGroup[] {
    const groups = new Map<string, EnhancedActivityItem[]>();

    activities.forEach((activity) => {
      const date = activity.date;
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(activity);
    });

    return Array.from(groups.entries())
      .map(([date, activities]) => ({
        date,
        activities: activities.sort((a, b) => b.id - a.id), // Sort by newest first
      }))
      .sort((a, b) => {
        if (a.date === 'Today') return -1;
        if (b.date === 'Today') return 1;
        if (a.date === 'Yesterday') return -1;
        if (b.date === 'Yesterday') return 1;
        return a.date.localeCompare(b.date);
      });
  }

  private _getActivityIcon(type: ActivityType): IconName {
    const iconMap: Record<ActivityType, IconName> = {
      ITEM_CREATED: 'lucidePlus',
      ITEM_UPDATED: 'lucidePencil',
      ITEM_DELETED: 'lucideX',
      ROOM_CREATED: 'lucideWarehouse',
      ROOM_UPDATED: 'lucideSettings',
      ROOM_DELETED: 'lucideX',
      HOUSE_CREATED: 'lucideHousePlus',
      HOUSE_UPDATED: 'lucideSettings',
      HOUSE_DELETED: 'lucideX',
      USER_LOGIN: 'lucideLogIn',
      USER_LOGOUT: 'lucideLogOut',
      USER_REGISTERED: 'lucideUser',
      ROOM_SHARED: 'lucideArrowRight',
      HOUSE_SHARED: 'lucideArrowRight',
      CATEGORY_CREATED: 'lucideTag',
      CATEGORY_UPDATED: 'lucidePencil',
      CATEGORY_DELETED: 'lucideX',
      LOW_STOCK: 'lucideTriangleAlert',
      STOCK_UPDATED: 'lucideBox',
    };

    return iconMap[type] || 'CirclePlus';
  }

  private _getActivityColor(type: ActivityType): string {
    // Use CSS custom properties that follow the theme
    const colorMap: Record<ActivityType, string> = {
      ITEM_CREATED: '[color:var(--chart-2)]', // Green/success
      ITEM_UPDATED: '[color:var(--chart-1)]', // Primary/blue
      ITEM_DELETED: '[color:var(--destructive)]', // Red/destructive
      ROOM_CREATED: '[color:var(--chart-4)]', // Purple/accent
      ROOM_UPDATED: '[color:var(--chart-1)]', // Primary
      ROOM_DELETED: '[color:var(--destructive)]', // Red
      HOUSE_CREATED: '[color:var(--primary)]', // Primary brand
      HOUSE_UPDATED: '[color:var(--chart-1)]', // Primary
      HOUSE_DELETED: '[color:var(--destructive)]', // Red
      USER_LOGIN: '[color:var(--chart-2)]', // Green
      USER_LOGOUT: 'text-muted-foreground', // Muted
      USER_REGISTERED: '[color:var(--chart-2)]', // Green
      ROOM_SHARED: '[color:var(--chart-5)]', // Cyan/info
      HOUSE_SHARED: '[color:var(--chart-5)]', // Cyan/info
      CATEGORY_CREATED: '[color:var(--chart-3)]', // Orange/warning
      CATEGORY_UPDATED: '[color:var(--chart-1)]', // Primary
      CATEGORY_DELETED: '[color:var(--destructive)]', // Red
      LOW_STOCK: '[color:var(--chart-3)]', // Orange/warning
      STOCK_UPDATED: '[color:var(--chart-1)]', // Primary
    };

    return colorMap[type] || 'text-muted-foreground';
  }

  private _getActivityBgColor(type: ActivityType): string {
    // Use theme-aware background colors with proper opacity
    const bgColorMap: Record<ActivityType, string> = {
      ITEM_CREATED: '[background:color-mix(in_srgb,var(--chart-2)_10%,transparent)]',
      ITEM_UPDATED: '[background:color-mix(in_srgb,var(--chart-1)_10%,transparent)]',
      ITEM_DELETED: '[background:color-mix(in_srgb,var(--destructive)_10%,transparent)]',
      ROOM_CREATED: '[background:color-mix(in_srgb,var(--chart-4)_10%,transparent)]',
      ROOM_UPDATED: '[background:color-mix(in_srgb,var(--chart-1)_10%,transparent)]',
      ROOM_DELETED: '[background:color-mix(in_srgb,var(--destructive)_10%,transparent)]',
      HOUSE_CREATED: '[background:color-mix(in_srgb,var(--primary)_10%,transparent)]',
      HOUSE_UPDATED: '[background:color-mix(in_srgb,var(--chart-1)_10%,transparent)]',
      HOUSE_DELETED: '[background:color-mix(in_srgb,var(--destructive)_10%,transparent)]',
      USER_LOGIN: '[background:color-mix(in_srgb,var(--chart-2)_10%,transparent)]',
      USER_LOGOUT: 'bg-muted/50',
      USER_REGISTERED: '[background:color-mix(in_srgb,var(--chart-2)_10%,transparent)]',
      ROOM_SHARED: '[background:color-mix(in_srgb,var(--chart-5)_10%,transparent)]',
      HOUSE_SHARED: '[background:color-mix(in_srgb,var(--chart-5)_10%,transparent)]',
      CATEGORY_CREATED: '[background:color-mix(in_srgb,var(--chart-3)_10%,transparent)]',
      CATEGORY_UPDATED: '[background:color-mix(in_srgb,var(--chart-1)_10%,transparent)]',
      CATEGORY_DELETED: '[background:color-mix(in_srgb,var(--destructive)_10%,transparent)]',
      LOW_STOCK: '[background:color-mix(in_srgb,var(--chart-3)_10%,transparent)]',
      STOCK_UPDATED: '[background:color-mix(in_srgb,var(--chart-1)_10%,transparent)]',
    };

    return bgColorMap[type] || 'bg-muted/50';
  }

  private _formatRelativeTime(date: string | number | Date): string {
    return formatRelativeTime(date);
  }

  private _formatDate(date: string | number | Date): string {
    return formatDateForGrouping(date);
  }
}
