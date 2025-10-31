import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableCol } from '@features/dashboard/models';
import { Item } from '@features/item';
import { ZardTableModule } from '@ui/table';

@Component({
  selector: 'hia-items-table-view',
  imports: [CommonModule, ZardTableModule],
  templateUrl: './items-table-view.component.html',
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsTableViewComponent {
  items = input<Item[]>([]);
  columns = input<TableCol[]>();
  sortKey = input<any>();
  sortDir = input<'asc' | 'desc'>();

  readonly onSort = output<any>();

  onColSort(key: string) {
    const col = this.columns()!.find((col) => col.key === key);

    if (!col || !col.sortable) return;
    this.onSort.emit(key);
  }

  getRaw(item: any, col: { key: any; get?: (it: any) => unknown }) {
    if (col.get) return col.get(item);

    const key = col.key;

    if (key === 'purchasePrice') return item.purchasePrice ?? item.price ?? null;
    if (key === 'room') return item.room?.name;
    if (key === 'category') return item.category?.name;
    if (key === 'updatedAt') return item.updatedAt ? new Date(item.updatedAt) : null;
    if (key === 'purchaseDate') return item.purchaseDate ? new Date(item.purchaseDate) : null;
    if (key === 'tags') return (item.tags?.length || 0) > 0 ? item.tags.join(', ') : '';
    return (item as any)[key] ?? null;
  }
}
