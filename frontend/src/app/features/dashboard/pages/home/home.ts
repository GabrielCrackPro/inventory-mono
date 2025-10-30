import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { IconName } from '@core/config';
import { DashboardData, DashboardService, ActivityFeed, HomeSkeleton } from '@features/dashboard';
import { ProfileService } from '@features/user';
import { LoadingService } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { ItemListComponent, ListItem } from '@ui/list';
import { StatsCardComponent } from '@ui/stats';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: IconName;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

@Component({
  selector: 'hia-home',
  imports: [
    ZardButtonComponent,
    ZardCardComponent,
    HomeSkeleton,
    IconComponent,
    StatsCardComponent,
    ItemListComponent,
    ActivityFeed,
    RouterLink,
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly _loadingService = inject(LoadingService);
  private readonly _profileService = inject(ProfileService);
  private readonly _dashboardService = inject(DashboardService);

  private readonly _dashboardData = signal<DashboardData>({
    activities: [],
    recentItems: [],
    lowStockItems: [],
  });

  private readonly _loadingState = signal<LoadingState>({
    isLoading: false,
    error: null,
  });

  profile = computed(() => this._profileService.getProfile());
  activities = computed(() => this._dashboardData().activities);
  recentItems = computed(() => this._dashboardData().recentItems);
  lowStockItems = computed(() => this._dashboardData().lowStockItems);

  loadingState = computed(() => this._loadingState());
  isLoading = computed(() => this._loadingState().isLoading);

  stats = computed(() => {
    const { items, rooms, categories } = this._profileService.getStats();
    return this._buildStatCards({
      items,
      rooms,
      categories,
      lowStock: this._dashboardData().lowStockItems.length,
    });
  });

  ngOnInit(): void {
    this._loadDashboardData();
  }

  private _loadDashboardData(): void {
    this._setLoadingState({ isLoading: true, error: null });

    this._dashboardService
      .loadDashboardData()
      .pipe(
        finalize(() => {
          this._setLoadingState({ isLoading: false });
        })
      )
      .subscribe({
        next: (data) => {
          this._dashboardData.set(data);
        },
        error: (error) => {
          console.error('Failed to load dashboard data:', error);
          this._setLoadingState({
            isLoading: false,
            error: 'Failed to load dashboard data. Please try again.',
          });
        },
      });
  }

  private _setLoadingState(state: Partial<LoadingState>): void {
    this._loadingState.update((current) => ({ ...current, ...state }));
  }

  refreshData(): void {
    this._loadDashboardData();
  }

  // Transform recent items for the item list component
  recentItemsList = computed((): ListItem[] =>
    this.recentItems().map((item) => {
      const addedDate = new Date(item.addedDate);
      const isRecent = new Date().getTime() - addedDate.getTime() < 24 * 60 * 60 * 1000; // Less than 24 hours

      return {
        id: item.id,
        title: item.name,
        subtitle: `${item.room.name} • ${item.category.name}`,
        // description: `Added to your inventory`,
        icon: item.icon,
        badge: `${item.quantity}`,
        badgeVariant: item.quantity > 10 ? 'success' : item.quantity > 5 ? 'default' : 'warning',
        status: item.quantity <= 2 ? 'low-stock' : item.quantity === 0 ? 'out-of-stock' : 'normal',
        isNew: isRecent,
        lastUpdated: addedDate,
        tags: ['Recent'],
        metadata: { addedDate: item.addedDate },
      } as ListItem;
    })
  );

  handleItemClick(item: ListItem): void {
    console.log('Item clicked:', item);
    // TODO: Navigate to item details or open edit dialog
  }

  handleActivityClick(activity: any): void {
    console.log('Activity clicked:', activity);
    // TODO: Navigate to related item/room/house or show activity details
  }

  // Transform low stock items for the item list component
  lowStockItemsList = computed((): ListItem[] =>
    this.lowStockItems().map(
      (item) =>
        ({
          id: item.id,
          title: item.name,
          subtitle: `${item.room.name}`,
          description: `Only ${item.quantity} left in stock`,
          icon: 'TriangleAlert',
          badge: `${item.quantity}`,
          badgeVariant: item.quantity === 0 ? 'destructive' : 'warning',
          status: item.quantity === 0 ? 'out-of-stock' : 'low-stock',
          tags: ['Low Stock'],
          metadata: { quantity: item.quantity },
        } as ListItem)
    )
  );

  private _buildStatCards({
    items = 0,
    rooms = 0,
    categories = 0,
    lowStock = 0,
  }: {
    items?: number;
    rooms?: number;
    categories?: number;
    lowStock?: number;
  }): DashboardStat[] {
    const statsMap: Record<string, { icon: IconName; value: number }> = {
      Items: { icon: 'Box', value: items },
      Rooms: { icon: 'Warehouse', value: rooms },
      Categories: { icon: 'List', value: categories },
      'Low Stock': { icon: 'TriangleAlert', value: lowStock },
    };

    return Object.entries(statsMap).map(([title, { icon, value }]) => ({
      title,
      icon,
      value: value.toString(),
      change: '0',
      trend: 'up',
    }));
  }
}
