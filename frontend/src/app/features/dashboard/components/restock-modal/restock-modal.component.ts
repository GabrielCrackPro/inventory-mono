import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { forkJoin, map } from 'rxjs';

import { commonIcons } from '@core/config/icon.config';
import { ItemService, LowStockItem } from '@features/item';
import { ToastService, Z_MODAL_DATA } from '@shared/services';
import { ZardDialogRef } from '@ui/dialog';
import { ZardQuantityInputComponent } from '@ui/quantity-input';
import { ZardButtonComponent } from '@ui/button';
import { IconComponent } from '@ui/icon';

interface RestockItem extends LowStockItem {
  newQuantity: number;
  minStock: number;
  category: any;
}

@Component({
  selector: 'hia-restock-modal',
  standalone: true,
  imports: [
    FormsModule,
    ZardQuantityInputComponent,
    ZardButtonComponent,
    IconComponent,
    TitleCasePipe,
  ],
  templateUrl: './restock-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestockModalComponent implements OnInit {
  private readonly _itemService = inject(ItemService);
  private readonly _toastService = inject(ToastService);
  private readonly _dialogRef = inject(ZardDialogRef);

  readonly commonIcons = commonIcons;

  private readonly modalData = inject(Z_MODAL_DATA) as { lowStockItems: LowStockItem[] };

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly lowStockItems = signal<RestockItem[]>([]);
  readonly hasChanges = computed(() =>
    this.lowStockItems().some((item) => item.newQuantity !== item.quantity)
  );

  ngOnInit(): void {
    this.initializeFromData();
  }

  private initializeFromData(): void {
    if (!this.modalData?.lowStockItems) {
      console.warn('No low stock items data provided to restock modal');
      return;
    }

    const restockItems: RestockItem[] = this.modalData.lowStockItems.map((item) => ({
      ...item,
      newQuantity: item.quantity,
      minStock: 5,
      category: item.category,
      unit: item.unit,
    }));

    this.lowStockItems.set(restockItems);
  }

  onQuantityChange(itemId: string, newQuantity: number): void {
    const items = this.lowStockItems();
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, newQuantity } : item
    );
    this.lowStockItems.set(updatedItems);
  }

  onSave(): void {
    const itemsToUpdate = this.lowStockItems().filter((item) => item.newQuantity !== item.quantity);

    if (itemsToUpdate.length === 0) {
      this._toastService.info({
        title: 'Info',
        message: 'No changes to save',
      });
      this._dialogRef.close();
      return;
    }

    this.isSaving.set(true);

    const updateRequests = itemsToUpdate.map((item) =>
      this._itemService.updateQuantity(item.id, item.newQuantity)
    );

    forkJoin(updateRequests).subscribe({
      next: (updatedItems) => {
        this._toastService.success({
          title: 'Success',
          message: `Successfully updated ${updatedItems.length} items`,
        });
        this.isSaving.set(false);
        // Close dialog with success result to trigger parent refresh
        this._dialogRef.close({ success: true, updatedCount: updatedItems.length });
      },
      error: (error) => {
        console.error('Failed to update items:', error);
        this._toastService.error({
          title: 'Error',
          message: 'Failed to update some items',
        });
        this.isSaving.set(false);
        // Don't close dialog on error
      },
    });
  }

  onCancel(): void {
    const items = this.lowStockItems();
    const resetItems = items.map((item) => ({ ...item, newQuantity: item.quantity }));
    this.lowStockItems.set(resetItems);
  }

  onOk(): boolean {
    this.onSave();
    return false; // Prevent default dialog close, we handle it manually
  }

  getStockStatus(item: RestockItem): 'critical' | 'low' | 'ok' {
    if (item.quantity === 0) return 'critical';
    if (item.quantity <= item.minStock * 0.5) return 'critical';
    if (item.quantity <= item.minStock) return 'low';
    return 'ok';
  }

  getStockStatusColor(status: 'critical' | 'low' | 'ok'): string {
    switch (status) {
      case 'critical':
        return 'text-destructive';
      case 'low':
        return '[color:var(--chart-3)]';
      case 'ok':
        return '[color:var(--chart-2)]';
    }
  }

  getStockStatusIcon(status: 'critical' | 'low' | 'ok'): string {
    switch (status) {
      case 'critical':
        return this.commonIcons['error'];
      case 'low':
        return this.commonIcons['warning'];
      case 'ok':
        return this.commonIcons['success'];
    }
  }

  getChangedItemsCount(): number {
    return this.lowStockItems().filter((item) => item.newQuantity !== item.quantity).length;
  }
}
