export interface TableCol {
  key: string;
  header: string;
  sortable?: boolean;
  format?: 'currency' | 'date' | 'datetime';
  get?: (item: any) => unknown;
  cellClass?: string;
}

export interface TableColAction {
  key: string;
  icon: string;
  action: string;
}

export type TableColSortKey =
  | 'name'
  | 'room'
  | 'category'
  | 'quantity'
  | 'unit'
  | 'minStock'
  | 'condition'
  | 'location'
  | 'brand'
  | 'model'
  | 'serialNumber'
  | 'tags'
  | 'purchasePrice'
  | 'purchaseDate'
  | 'updatedAt'
  | 'actions';
