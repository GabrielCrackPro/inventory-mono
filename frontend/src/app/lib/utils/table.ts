import { TableCol } from '@features/dashboard';

interface ColumnOptions {
  key: string;
  header: string;
  sortable?: boolean;
  format?: 'currency' | 'date' | 'datetime';
  cellClass?: string;
  get?: (item: any) => unknown;
  // Optional dot-path for nested extraction, e.g. 'room.name'
  path?: string;
  visible?: boolean;
}

function getByPath(obj: any, path?: string) {
  if (!path) return undefined;
  return path.split('.').reduce((acc: any, seg: string) => (acc == null ? undefined : acc[seg]), obj);
}

export function createColumn(options: ColumnOptions): TableCol {
  const { key, header, sortable, format, cellClass, get, path, visible } = options;
  const getter = get
    ? get
    : path
    ? (it: any) => getByPath(it, path)
    : (it: any) => (it as any)[key];

  return {
    key,
    header,
    sortable,
    format,
    cellClass,
    get: getter,
    visible: visible ?? true,
  };
}
