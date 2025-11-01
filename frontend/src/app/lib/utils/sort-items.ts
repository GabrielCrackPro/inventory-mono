import { TableColSortKey } from '@features/dashboard';

export function getItemField(it: any, key: TableColSortKey) {
  if (key === 'purchasePrice') return it.purchasePrice ?? it.price ?? null;
  if (key === 'room') return it.room?.name;
  if (key === 'category') return it.category?.name;
  if (key === 'updatedAt') return it.updatedAt ? new Date(it.updatedAt) : null;
  if (key === 'purchaseDate') return it.purchaseDate ? new Date(it.purchaseDate) : null;
  if (key === 'tags') return (it.tags?.length || 0) > 0 ? it.tags.join(', ') : '';
  return (it as any)[key] ?? null;
}

export function sortItems<T = any>(items: T[], key: TableColSortKey, dir: 'asc' | 'desc') {
  const mul = dir === 'asc' ? 1 : -1;
  return [...items].sort((a: any, b: any) => {
    const va = getItemField(a, key);
    const vb = getItemField(b, key);
    if (va == null && vb == null) return 0;
    if (va == null) return -1 * mul;
    if (vb == null) return 1 * mul;
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mul;
    if (va instanceof Date && vb instanceof Date)
      return (va.getTime() - vb.getTime()) * mul;
    return String(va).localeCompare(String(vb)) * mul;
  });
}
