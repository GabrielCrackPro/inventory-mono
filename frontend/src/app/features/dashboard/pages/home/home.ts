import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconName, commonIcons } from '@core/config';
import {
  ActivityFeed,
  DashboardData,
  DashboardExportModalComponent,
  DashboardExportService,
  DashboardService,
  HomeSkeleton,
} from '@features/dashboard';
import { RestockModalComponent } from '@features/dashboard/components/restock-modal';
import { HouseService } from '@features/house';
import { InventoryPreferencesService } from '@features/house/services/inventory-preferences';
import { HouseContextService } from '@features/house/services';
import { ItemService } from '@features/item';
import { ProfileService } from '@features/user';
import { DialogService, LoadingService } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import {
  ZardDropdownDirective,
  ZardDropdownMenuContentComponent,
  ZardDropdownMenuItemComponent,
} from '@ui/dropdown';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { ItemListComponent, ListItem } from '@ui/list';
import { StatsCardComponent } from '@ui/stats';
import { finalize } from 'rxjs';

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
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly _loadingService = inject(LoadingService);
  private readonly _profileService = inject(ProfileService);
  private readonly _dashboardService = inject(DashboardService);
  private readonly _houseContext = inject(HouseContextService);
  private readonly _itemService = inject(ItemService);
  private readonly _houseService = inject(HouseService);
  private readonly _dialogService = inject(DialogService);
  private readonly _exportService = inject(DashboardExportService);
  private readonly _inventoryPrefs = inject(InventoryPreferencesService);

  readonly commonIcons = commonIcons;

  private readonly _dashboardData = signal<DashboardData>({
    activities: [],
    recentItems: [],
    lowStockItems: [],
  });

  private readonly _loadingState = signal<LoadingState>({
    isLoading: false,
    error: null,
  });

  // Separate loading flag for activity feed only
  private readonly _activitiesLoading = signal<boolean>(false);

  profile = computed(() => this._profileService.getProfile());
  activities = computed(() => this._dashboardData().activities);
  recentItems = computed(() => this._dashboardData().recentItems);
  lowStockItems = computed(() => this._dashboardData().lowStockItems);

  loadingState = computed(() => this._loadingState());
  isLoading = computed(() => this._loadingState().isLoading);
  activitiesLoading = computed(() => this._activitiesLoading());

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
    this._loadCounters();

    this._houseContext.selectedHouseChanged$.subscribe(() => {
      this._loadDashboardData();
      this._loadCounters();
    });
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

  // Refresh only the activity feed, not the entire dashboard
  refreshActivities(): void {
    this._activitiesLoading.set(true);
    this._profileService
      .getActivities()
      .pipe(
        finalize(() => this._activitiesLoading.set(false))
      )
      .subscribe({
        next: (activities) => {
          this._dashboardData.update((curr) => ({ ...curr, activities }));
        },
        error: (error) => {
          console.error('Failed to refresh activities:', error);
        },
      });
  }

  exportItems(): void {
    this._dialogService.create({
      zContent: DashboardExportModalComponent,
      zOkText: 'Export',
      zOkIcon: 'lucideDownload',
      zCancelText: 'Cancel',
      zCancelIcon: 'lucideX',
      zClosable: false,
      zMaskClosable: true,
      zTitle: 'Export Dashboard Data',
      zDescription: 'Select the data you want to export',
      zOnOk: (cmp: DashboardExportModalComponent) => {
        const exportMap: Record<string, () => void> = {
          csv: () => this._exportService.exportItemsCsv(cmp.scope, cmp.selectedFields),
          json: () => this._exportService.exportItemsJson(cmp.scope, cmp.selectedFields),
        };

        if (!cmp.selectedFields || cmp.selectedFields.length === 0) {
          return false;
        }
        exportMap[cmp.format]();
        return;
      },
    });
  }

  private _loadCounters(): void {
    this._itemService.getItems().subscribe((items) => {
      this._houseService.getActiveHouseRooms().subscribe((rooms) => {
        const current = this._profileService.getProfile() as any;
        const prevStats = current?.stats ?? {};
        this._profileService.updateStats({
          items: items.length,
          rooms: Array.isArray(rooms) ? rooms.length : 0,
          categories: prevStats.categories ?? 0,
          lowStockItems: prevStats.lowStockItems ?? 0,
        });
      });
    });
  }

  // Transform recent items for the item list component
  // This computed property automatically updates when recentItems() changes after restocking
  recentItemsList = computed((): ListItem[] =>
    this.recentItems().map((item) => {
      const addedDate = new Date(item.addedDate);
      const isRecent = new Date().getTime() - addedDate.getTime() < 24 * 60 * 60 * 1000; // Less than 24 hours

      // Determine stock status based on quantity
      const threshold = this.getLowStockThreshold();
      const getStockStatus = (quantity: number) => {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= threshold) return 'low-stock';
        return 'normal';
      };

      // Determine badge variant based on quantity
      const getBadgeVariant = (quantity: number) => {
        if (quantity === 0) return 'destructive';
        if (quantity <= threshold) return 'warning';
        if (quantity <= Math.max(threshold + 3, threshold * 2)) return 'default';
        return 'success';
      };

      return {
        id: item.id,
        title: item.name,
        subtitle: undefined,
        icon: item.icon,
        badge: `${item.quantity}`,
        badgeVariant: getBadgeVariant(item.quantity),
        status: getStockStatus(item.quantity),
        isNew: isRecent,
        lastUpdated: addedDate,
        tags: ['Recent'],
        metadata: { 
          addedDate: item.addedDate, 
          originalQuantity: item.quantity,
          room: item.room,
          category: item.category
        },
      } as ListItem;
    })
  );

  private getLowStockThreshold(): number {
    const prefs = this._inventoryPrefs.getForCurrentHouse();
    const t = prefs?.lowStockThreshold;
    return typeof t === 'number' && t >= 0 ? t : 2;
  }

  handleRestockClick(): void {
    const component = RestockModalComponent;
    const dialogRef = this._dialogService.create({
      zContent: component,
      zData: {
        lowStockItems: this.lowStockItems(),
      },
      zOkText: 'Save Changes',
      zOkIcon: 'lucideSave',
      zCancelText: 'Close',
      zWidth: 'lg',
      zHideFooter: true,
      zOnOk: (cmp: RestockModalComponent) => {
        cmp.onOk();
        return false;
      },
      zOnCancel: (cmp: RestockModalComponent) => {
        cmp.onCancel();
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this._loadDashboardData();
        this._loadCounters();
      }
    });
  }

  handleItemClick(item: ListItem): void {
    console.log('Item clicked:', item);
  }

  handleActivityClick(activity: any): void {
    console.log('Activity clicked:', activity);
  }

  handleViewAllActivities(): void {
    console.log('Navigate to full activity page');
    // TODO: Navigate to the full activity page when it's created
    // this._router.navigate(['/activities']);
  }

  lowStockItemsList = computed((): ListItem[] =>
    this.lowStockItems().map((item) => {
      const threshold = this.getLowStockThreshold();
      const getStockStatus = (quantity: number) => {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= threshold) return 'low-stock';
        return 'normal';
      };

      const getBadgeVariant = (quantity: number) => {
        if (quantity === 0) return 'destructive';
        if (quantity <= threshold) return 'warning';
        if (quantity <= Math.max(threshold + 3, threshold * 2)) return 'default';
        return 'success';
      };

      return {
        id: item.id,
        title: item.name,
        subtitle: undefined,
        description: `Only ${item.quantity} left in stock`,
        icon: 'lucideTriangleAlert',
        badge: `${item.quantity}`,
        badgeVariant: getBadgeVariant(item.quantity),
        status: getStockStatus(item.quantity),
        tags: ['Low Stock'],
        metadata: { quantity: item.quantity, room: item.room, category: item.category },
      } as ListItem;
    })
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
      Items: { icon: commonIcons['item'], value: items },
      Rooms: { icon: commonIcons['room'], value: rooms },
      Categories: { icon: commonIcons['category'], value: categories },
      'Low Stock': { icon: commonIcons['warning'], value: lowStock },
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
