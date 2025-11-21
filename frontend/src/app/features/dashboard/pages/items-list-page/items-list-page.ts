import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { IconName } from '@core/config';
import { TableCol, TableColSortKey } from '@features/dashboard';
import { Item, ItemService } from '@features/item';
import { HouseContextService } from '@features/house/services/house-context';
import { ProfileService } from '@features/user';
import { buildItemColumns, sortItems } from '@lib/utils';
import { AlertDialogService, DialogService, LoadingService } from '@shared/services';
import { PermissionService } from '@core/services/permission';
import { ItemsGridViewComponent } from './items-grid-view';
import { ItemsTableSettingsComponent, ItemsTableViewComponent } from './items-table-view';
import { ItemListPageSkeletonComponent } from './item-list-page-skeleton';
import { ZardEmptyComponent } from '@ui/empty';
import { ZardCardComponent } from '@ui/card';
import { ItemsListHeaderComponent } from './items-list-header';
import { ZardButtonComponent } from '@ui/button';
import { ZardBreadcrumbComponent, ZardBreadcrumbItemComponent } from '@ui/breadcrumb';

interface ViewOption {
  value: string;
  label: string;
  icon: IconName;
}

type ViewMode = 'grid' | 'table';

@Component({
  selector: 'hia-items-list-page',
  imports: [
    ItemsGridViewComponent,
    ItemsTableViewComponent,
    ItemListPageSkeletonComponent,
    ZardEmptyComponent,
    ZardCardComponent,
    ItemsListHeaderComponent,
    ZardButtonComponent,
    ZardBreadcrumbComponent,
    ZardBreadcrumbItemComponent,
  ],
  templateUrl: './items-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListPageComponent implements OnInit {
  private readonly _itemsService = inject(ItemService);
  private readonly _profileService = inject(ProfileService);
  private readonly _dialogService = inject(DialogService);
  private readonly _alertDialogService = inject(AlertDialogService);
  private readonly _loadingService = inject(LoadingService);
  private readonly _houseContext = inject(HouseContextService);
  private readonly _permission = inject(PermissionService);

  private _items = signal<Item[]>([]);
  private hiddenCols = signal<Set<string>>(new Set());
  private colOrder = signal<string[] | null>(null);

  defaultView = signal<ViewMode>(
    this._coerceViewMode(
      (this._profileService.getProfile() as any)?.preferences?.itemsViewMode ?? null
    )
  );

  selectMode = signal<boolean>(false);

  loading = computed(() => this._loadingService.isLoading());

  viewMode = computed<ViewMode>(() => this.defaultView());
  sortKey = signal<TableColSortKey>('updatedAt');
  sortDir = signal<'asc' | 'desc'>('desc');

  // Permissions
  canCreateItem = computed(() => this._permission.can('item:create'));

  ngOnInit(): void {
    this.reloadItems();
    this._houseContext.selectedHouseChanged$.subscribe(() => this.reloadItems());
    const prefHidden = (this._profileService.getProfile() as any)?.preferences?.itemsHiddenCols as
      | string[]
      | undefined;
    if (Array.isArray(prefHidden)) {
      this.hiddenCols.set(new Set(prefHidden));
    }
    const prefOrder = (this._profileService.getProfile() as any)?.preferences?.itemsColsOrder as
      | string[]
      | undefined;
    if (Array.isArray(prefOrder)) {
      this.colOrder.set(prefOrder);
    }
  }

  onToggleSelect(evt: { id: string; selected: boolean }): void {
    const current = this.selectedItems();
    if (evt.selected) {
      if (!current.some((it) => it.id === evt.id)) {
        const item = this.items().find((it) => it.id === evt.id);
        if (item) this.selectedItems.set([...current, item]);
      }
    } else {
      this.selectedItems.set(current.filter((it) => it.id !== evt.id));
    }
  }

  onToggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedItems.set([...this.itemsSorted()]);
    } else {
      this.selectedItems.set([]);
    }
  }

  private _coerceViewMode(val: string | null): ViewMode {
    return val === 'table' || val === 'grid' ? (val as ViewMode) : 'grid';
  }

  selectedItems = signal<Item[]>([]);

  selectedIds = computed<string[]>(() => this.selectedItems().map((it) => it.id));

  items = computed(() => this._items());

  viewOptions = computed<ViewOption[]>(() => [
    { value: 'grid', label: '', icon: 'lucideGrid3x3' },
    { value: 'table', label: '', icon: 'lucideTableProperties' },
  ]);

  tableActions = computed<
    { label: string; icon: IconName; iconClasses: string; action: () => void }[]
  >(() => {
    const canDelete = this._permission.can('item:delete');
    if (!canDelete) return [];
    return [
      {
        label: '',
        icon: 'lucideTrash',
        iconClasses: 'text-destructive',
        action: () => this.handleDelete(),
      },
    ];
  });

  readonly columns = computed<(TableCol | null)[]>(() => {
    const hidden = this.hiddenCols();
    const order = this.colOrder();
    const cols = buildItemColumns(this.selectMode()).filter((c) => c) as TableCol[];
    const selectCol = cols.find((c) => c.key === 'select') || null;
    const others = cols.filter((c) => c.key !== 'select');
    // apply order if present to non-select columns only
    const orderedOthers = order
      ? [...others].sort((a, b) => {
          const ia = order.indexOf(a.key);
          const ib = order.indexOf(b.key);
          return (
            (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib)
          );
        })
      : others;
    const merged = selectCol ? [selectCol, ...orderedOthers] : orderedOthers;
    return merged.map((c) => ({ ...c, visible: c.key === 'select' ? true : !hidden.has(c.key) }));
  });

  itemsSorted = computed(() => sortItems(this.items(), this.sortKey(), this.sortDir()));

  setSort(key: TableColSortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  changeViewMode(mode: string): void {
    const next = this._coerceViewMode(mode);
    this.defaultView.set(next);
    this._profileService.savePreferences({ itemsViewMode: next })?.subscribe();
  }

  reloadItems(): void {
    this._itemsService.getItems().subscribe((items) => {
      this._items.set(items);
      const currentProfile = this._profileService.getProfile() as any;
      const prevStats = currentProfile?.stats ?? {};
      this._profileService.updateProfile({
        ...currentProfile,
        stats: {
          items: items.length,
          rooms: prevStats.rooms ?? 0,
          categories: prevStats.categories ?? 0,
          lowStockItems: prevStats.lowStockItems ?? 0,
        },
      });
    });
  }

  toggleSelectMode(): void {
    this.selectMode.update((prev) => !prev);
  }

  handleDelete(): void {
    this._alertDialogService.confirm({
      zTitle: 'Delete Items',
      zContent: `Are you sure you want to delete ${this.selectedIds().length} items?`,
      zType: 'destructive',
      zOkDestructive: true,
      zOnOk: () => {
        this._itemsService.deleteMultipleItems(this.selectedIds()).subscribe(() => {
          this.selectedItems.set([]);
          this.selectMode.set(false);
          this.reloadItems();
        });
      },
    });
  }

  onSettingsClick(): void {
    this._dialogService.create({
      zContent: ItemsTableSettingsComponent,
      zTitle: 'Table Settings',
      zOkIcon: 'lucideSave',
      zOkText: 'Save',
      zCancelIcon: 'lucideX',
      zCancelText: 'Cancel',
      zClosable: false,
      zData: {
        columns: this.columns(),
        defaultOrder: (
          buildItemColumns(this.selectMode()).filter((c) => c && c.key !== 'select') as TableCol[]
        ).map((c) => c.key),
      },
      zOnOk: (cmp: any) => {
        try {
          const keys: string[] = cmp.getHiddenKeys?.() ?? [];
          this.hiddenCols.set(new Set(keys));
          const order: string[] = cmp.getOrder?.() ?? this.colOrder() ?? [];
          this.colOrder.set(order.length ? order : null);
          const defaultOrder = (
            buildItemColumns(this.selectMode()).filter((c) => c && c.key !== 'select') as TableCol[]
          ).map((c) => c.key);
          const isDefault =
            order.length === defaultOrder.length && order.every((k, i) => k === defaultOrder[i]);
          const payload: any = { itemsHiddenCols: keys };
          if (!isDefault && order.length) {
            payload.itemsColsOrder = order;
          }
          this._profileService.savePreferences(payload)?.subscribe();
        } catch {}
      },
    });
  }
}
