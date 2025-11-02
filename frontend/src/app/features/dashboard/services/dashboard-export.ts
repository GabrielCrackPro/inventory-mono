import { Injectable, inject } from '@angular/core';
import { ItemService } from '@features/item';
import { HouseContextService } from '@features/house/services/house-context';

@Injectable({
  providedIn: 'root',
})
export class DashboardExportService {
  private readonly _itemService = inject(ItemService);
  private readonly _houseContext = inject(HouseContextService);

  exportItemsCsv(scope: 'all' | 'low-stock' = 'all', fields?: string[]): void {
    this._itemService.getItems().subscribe((items: any[]) => {
      const filtered =
        scope === 'low-stock' ? items.filter((it) => (it?.quantity ?? 0) <= 2) : items;
      const csv = this._buildItemsCsv(filtered, fields);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const houseId = this._houseContext.currentSelectedHouseId() ?? 'all';
      link.href = url;
      link.download = `inventory-items-${scope}-house-${houseId}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  exportItemsJson(scope: 'all' | 'low-stock' = 'all', fields?: string[]): void {
    this._itemService.getItems().subscribe((items: any[]) => {
      const filtered =
        scope === 'low-stock' ? items.filter((it) => (it?.quantity ?? 0) <= 2) : items;
      const selected = fields && fields.length > 0 ? fields : ['id', 'name', 'room', 'category', 'quantity', 'unit'];
      const json = JSON.stringify(
        filtered.map((it) => this._pickFields(it, selected)),
        null,
        2
      );
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const houseId = this._houseContext.currentSelectedHouseId() ?? 'all';
      link.href = url;
      link.download = `inventory-items-${scope}-house-${houseId}-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  private _buildItemsCsv(items: any[], fields?: string[]): string {
    const headers = (fields && fields.length > 0
      ? fields
      : ['id', 'name', 'room', 'category', 'quantity', 'unit']);
    if (!items || items.length === 0) {
      return headers.join(',') + '\n';
    }
    const escape = (v: any) => {
      const s = v === undefined || v === null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const rows = items.map((it) =>
      headers
        .map((key) => this._resolveValue(it, key))
        .map(escape)
        .join(',')
    );
    return headers.join(',') + '\n' + rows.join('\n');
  }

  private _resolveValue(item: any, key: string): any {
    switch (key) {
      case 'room':
        return item.room?.name;
      case 'category':
        return item.category?.name;
      default:
        return item[key];
    }
  }

  private _pickFields(item: any, fields: string[]) {
    const out: any = {};
    for (const key of fields) {
      out[key] = this._resolveValue(item, key);
    }
    return out;
  }
}

