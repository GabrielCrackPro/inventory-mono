import { TableCol } from '@features/dashboard';
import { createColumn } from '@lib/utils';

export function buildItemColumns(selectMode: boolean): (TableCol | null)[] {
  return [
    selectMode ? createColumn({ key: 'select', header: 'Select' }) : null,
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
}
