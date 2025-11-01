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
import { ProfileService } from '@features/user';
import { buildItemColumns, sortItems } from '@lib/utils';
import { AlertDialogService, LoadingService } from '@shared/services';
import { ItemsGridViewComponent } from './items-grid-view';
import { ItemsTableViewComponent } from './items-table-view';
import { ItemListPageSkeletonComponent } from './item-list-page-skeleton';
import { ZardEmptyComponent } from '@ui/empty';
import { ZardCardComponent } from '@ui/card';
import { RouterLink } from '@angular/router';
import { ItemsListHeaderComponent } from './items-list-header';
import { ZardButtonComponent } from '@ui/button';

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
    RouterLink,
    ItemsListHeaderComponent,
    ZardButtonComponent,
  ],
  templateUrl: './items-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListPageComponent implements OnInit {
  private readonly _itemsService = inject(ItemService);
  private readonly _profileService = inject(ProfileService);
  private readonly _alertDialogService = inject(AlertDialogService);
  private readonly _loadingService = inject(LoadingService);

  private _items = signal<Item[]>([]);

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

  ngOnInit(): void {
    this._itemsService.getItems().subscribe((items) => {
      this._items.set(items);
    });
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
    { value: 'grid', label: '', icon: 'Grid3x3' },
    { value: 'table', label: '', icon: 'TableProperties' },
  ]);

  tableActions = computed<
    { label: string; icon: IconName; iconClasses: string; action: () => void }[]
  >(() => [
    {
      label: '',
      icon: 'Trash',
      iconClasses: 'text-destructive',
      action: () => this.handleDelete(),
    },
  ]);

  readonly columns = computed<(TableCol | null)[]>(() =>
    buildItemColumns(this.selectMode()).filter((c) => c)
  );

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
    const current = (this._profileService.getProfile() as any) ?? {};
    const updated = {
      ...current,
      preferences: {
        ...(current.preferences ?? {}),
        itemsViewMode: next,
      },
    };
    this._profileService.updateProfile(updated);
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

  onSettingsClick(): void {}
}
