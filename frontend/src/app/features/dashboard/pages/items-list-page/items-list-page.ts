import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TableCol, TableColSortKey } from '@features/dashboard';
import { Item, ItemService } from '@features/item';
import { createColumn } from '@lib/utils';
import { ZardButtonComponent } from '@ui/button';
import { ZardSegmentedComponent } from '@ui/segmented';
import { ItemsGridViewComponent } from './items-grid-view';
import { ItemsTableViewComponent } from './items-table-view';
import { IconName } from '@core/config';
import { StorageService } from '@core/services';
import { ProfileService } from '@features/user/services/profile';

interface ViewOption {
  value: string;
  label: string;
  icon: IconName;
}

type ViewMode = 'grid' | 'table';

@Component({
  selector: 'hia-items-list-page',
  imports: [
    ZardButtonComponent,
    ZardSegmentedComponent,
    ItemsGridViewComponent,
    ItemsTableViewComponent,
  ],
  templateUrl: './items-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListPageComponent implements OnInit {
  private readonly _itemsService = inject(ItemService);
  private readonly _profileService = inject(ProfileService);

  private _items = signal<Item[]>([]);

  defaultView = signal<ViewMode>(
    this._coerceViewMode(
      (this._profileService.getProfile() as any)?.preferences?.itemsViewMode ?? null
    )
  );

  viewMode = computed<ViewMode>(() => this.defaultView());
  sortKey = signal<TableColSortKey>('updatedAt');
  sortDir = signal<'asc' | 'desc'>('desc');

  ngOnInit(): void {
    this._itemsService.getItems().subscribe((items) => {
      this._items.set(items);
    });
  }

  private _coerceViewMode(val: string | null): ViewMode {
    return val === 'table' || val === 'grid' ? (val as ViewMode) : 'grid';
  }

  items = computed(() => this._items());

  viewOptions = computed<ViewOption[]>(() => [
    { value: 'grid', label: 'Grid', icon: 'Grid2x2' },
    { value: 'table', label: 'Table', icon: 'Table' },
  ]);

  readonly columns: TableCol[] = [
    createColumn({
      key: 'name',
      header: 'Name',
      sortable: true,
      cellClass: 'font-medium max-w-[250px] truncate',
    }),
    createColumn({
      key: 'room',
      header: 'Room',
      sortable: true,
      path: 'room.name',
      cellClass: 'max-w-[160px] truncate',
    }),
    createColumn({
      key: 'category',
      header: 'Category',
      sortable: true,
      path: 'category.name',
      cellClass: 'max-w-[160px] truncate',
    }),
    createColumn({
      key: 'quantity',
      header: 'Qty',
      sortable: true,
      cellClass: 'text-right w-12 tabular-nums',
    }),
    createColumn({ key: 'unit', header: 'Unit', sortable: true, cellClass: 'w-16' }),
    createColumn({
      key: 'minStock',
      header: 'Min',
      sortable: true,
      cellClass: 'text-right w-12 tabular-nums',
    }),
    createColumn({ key: 'condition', header: 'Condition', sortable: true }),
    createColumn({ key: 'location', header: 'Location', cellClass: 'max-w-[160px] truncate' }),
    createColumn({
      key: 'brand',
      header: 'Brand',
      sortable: true,
      cellClass: 'max-w-[140px] truncate',
    }),
    createColumn({
      key: 'model',
      header: 'Model',
      sortable: true,
      cellClass: 'max-w-[140px] truncate',
    }),
    createColumn({ key: 'serialNumber', header: 'Serial', cellClass: 'max-w-[120px] truncate' }),
    createColumn({
      key: 'tags',
      header: 'Tags',
      cellClass: 'max-w-[180px] truncate',
      get: (it) => (it.tags?.length ? it.tags.join(', ') : '-'),
    }),
    createColumn({
      key: 'purchasePrice',
      header: 'Price',
      sortable: true,
      format: 'currency',
      cellClass: 'whitespace-nowrap text-right tabular-nums w-[120px]',
      get: (it) => it.purchasePrice ?? it.price ?? 0,
    }),
    createColumn({
      key: 'purchaseDate',
      header: 'Date',
      format: 'date',
      cellClass: 'whitespace-nowrap w-[120px]',
    }),
    createColumn({
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      format: 'datetime',
      cellClass: 'whitespace-nowrap',
    }),
  ];

  itemsSorted = computed(() => {
    const key = this.sortKey();
    const dir = this.sortDir();
    const mul = dir === 'asc' ? 1 : -1;
    return [...this.items()].sort((a: any, b: any) => {
      const va = this._getField(a, key);
      const vb = this._getField(b, key);
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * mul;
      if (vb == null) return 1 * mul;
      if (va instanceof Date && vb instanceof Date) return (va.getTime() - vb.getTime()) * mul;
      if (!isNaN(+va) && !isNaN(+vb)) return (+va - +vb) * mul;
      return String(va).localeCompare(String(vb)) * mul;
    });
  });

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

  private _getField(it: any, key: TableColSortKey) {
    if (key === 'purchasePrice') return it.purchasePrice ?? it.price ?? null;
    if (key === 'room') return it.room?.name;
    if (key === 'category') return it.category?.name;
    if (key === 'updatedAt') return it.updatedAt ? new Date(it.updatedAt) : null;
    if (key === 'purchaseDate') return it.purchaseDate ? new Date(it.purchaseDate) : null;
    if (key === 'tags') return (it.tags?.length || 0) > 0 ? it.tags.join(', ') : '';
    return (it as any)[key] ?? null;
  }

  // Helper for template cell rendering
  getRaw(item: any, col: { key: TableColSortKey; get?: (it: any) => unknown }) {
    return col.get ? col.get(item) : this._getField(item, col.key);
  }
}
