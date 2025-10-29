import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { IconName } from '@core/config';
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
  readonly activityClick = output<EnhancedActivityItem>();

  private readonly _enhancedActivities = signal<EnhancedActivityItem[]>([]);
  private readonly _refreshing = signal<boolean>(false);
  private readonly _expanded = signal<boolean>(false);

  private readonly DEFAULT_VISIBLE_ACTIVITIES = 3;

  readonly groupedActivities = computed(() =>
    this._groupActivitiesByDate(this.visibleActivities())
  );
  readonly hasActivities = computed(() => this._enhancedActivities().length > 0);
  readonly totalActivitiesCount = computed(() =>
    this.hasActivities()
      ? this.groupedActivities().reduce((sum, group) => sum + group.activities.length, 0)
      : 0
  );
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
      ITEM_CREATED: 'Plus',
      ITEM_UPDATED: 'Pencil',
      ITEM_DELETED: 'X',
      ROOM_CREATED: 'Warehouse',
      ROOM_UPDATED: 'Settings',
      ROOM_DELETED: 'X',
      HOUSE_CREATED: 'HousePlus',
      HOUSE_UPDATED: 'Settings',
      HOUSE_DELETED: 'X',
      USER_LOGIN: 'LogIn',
      USER_LOGOUT: 'LogOut',
      USER_REGISTERED: 'User',
      ROOM_SHARED: 'ArrowRight',
      HOUSE_SHARED: 'ArrowRight',
      CATEGORY_CREATED: 'Tag',
      CATEGORY_UPDATED: 'Pencil',
      CATEGORY_DELETED: 'X',
      LOW_STOCK: 'TriangleAlert',
      STOCK_UPDATED: 'Box',
    };

    return iconMap[type] || 'CirclePlus';
  }

  private _getActivityColor(type: ActivityType): string {
    const colorMap: Record<ActivityType, string> = {
      ITEM_CREATED: 'text-green-600',
      ITEM_UPDATED: 'text-blue-600',
      ITEM_DELETED: 'text-red-600',
      ROOM_CREATED: 'text-purple-600',
      ROOM_UPDATED: 'text-blue-600',
      ROOM_DELETED: 'text-red-600',
      HOUSE_CREATED: 'text-indigo-600',
      HOUSE_UPDATED: 'text-blue-600',
      HOUSE_DELETED: 'text-red-600',
      USER_LOGIN: 'text-green-600',
      USER_LOGOUT: 'text-gray-600',
      USER_REGISTERED: 'text-green-600',
      ROOM_SHARED: 'text-cyan-600',
      HOUSE_SHARED: 'text-cyan-600',
      CATEGORY_CREATED: 'text-orange-600',
      CATEGORY_UPDATED: 'text-blue-600',
      CATEGORY_DELETED: 'text-red-600',
      LOW_STOCK: 'text-amber-600',
      STOCK_UPDATED: 'text-blue-600',
    };

    return colorMap[type] || 'text-gray-600';
  }

  private _getActivityBgColor(type: ActivityType): string {
    const bgColorMap: Record<ActivityType, string> = {
      ITEM_CREATED: 'bg-green-50 dark:bg-green-950',
      ITEM_UPDATED: 'bg-blue-50 dark:bg-blue-950',
      ITEM_DELETED: 'bg-red-50 dark:bg-red-950',
      ROOM_CREATED: 'bg-purple-50 dark:bg-purple-950',
      ROOM_UPDATED: 'bg-blue-50 dark:bg-blue-950',
      ROOM_DELETED: 'bg-red-50 dark:bg-red-950',
      HOUSE_CREATED: 'bg-indigo-50 dark:bg-indigo-950',
      HOUSE_UPDATED: 'bg-blue-50 dark:bg-blue-950',
      HOUSE_DELETED: 'bg-red-50 dark:bg-red-950',
      USER_LOGIN: 'bg-green-50 dark:bg-green-950',
      USER_LOGOUT: 'bg-gray-50 dark:bg-gray-950',
      USER_REGISTERED: 'bg-green-50 dark:bg-green-950',
      ROOM_SHARED: 'bg-cyan-50 dark:bg-cyan-950',
      HOUSE_SHARED: 'bg-cyan-50 dark:bg-cyan-950',
      CATEGORY_CREATED: 'bg-orange-50 dark:bg-orange-950',
      CATEGORY_UPDATED: 'bg-blue-50 dark:bg-blue-950',
      CATEGORY_DELETED: 'bg-red-50 dark:bg-red-950',
      LOW_STOCK: 'bg-amber-50 dark:bg-amber-950',
      STOCK_UPDATED: 'bg-blue-50 dark:bg-blue-950',
    };

    return bgColorMap[type] || 'bg-gray-50 dark:bg-gray-950';
  }

  private _formatRelativeTime(date: string | number | Date): string {
    return formatRelativeTime(date);
  }

  private _formatDate(date: string | number | Date): string {
    return formatDateForGrouping(date);
  }
}
