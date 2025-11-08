import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { commonIcons } from '@core/config/icon.config';
import { Item, ItemService } from '@features/item';
import { ZardCardComponent } from '@ui/card';
import { ZardButtonComponent } from '@ui/button';
import { IconComponent } from '@ui/icon';
import { AlertDialogService, DialogService, ToastService } from '@shared/services';
import { ShareModalComponent } from '@features/dashboard/components';

@Component({
  selector: 'hia-item-detail-page',
  imports: [
    CommonModule,
    RouterLink,
    ZardCardComponent,
    ZardButtonComponent,
    IconComponent,
    TitleCasePipe,
  ],
  templateUrl: './item-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailPageComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _itemService = inject(ItemService);
  private readonly _toastService = inject(ToastService);
  private _dialogService = inject(DialogService);
  private readonly _alertDialogService = inject(AlertDialogService);

  readonly commonIcons = commonIcons;

  private readonly _item = signal<Item | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);

  readonly item = computed(() => this._item());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  readonly stockStatus = computed(() => {
    const item = this._item();
    if (!item) return 'normal';

    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.minStock) return 'low-stock';
    return 'normal';
  });

  readonly stockStatusConfig = computed(() => {
    const status = this.stockStatus();
    switch (status) {
      case 'out-of-stock':
        return {
          label: 'Out of Stock',
          icon: 'lucideAlertTriangle',
          class: 'text-destructive bg-destructive/10 border-destructive/20',
        };
      case 'low-stock':
        return {
          label: 'Low Stock',
          icon: 'lucideAlertTriangle',
          class:
            'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800/40',
        };
      default:
        return {
          label: 'In Stock',
          icon: 'lucideCheck',
          class:
            'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800/40',
        };
    }
  });

  ngOnInit(): void {
    const itemId = this._route.snapshot.paramMap.get('id');
    if (itemId) {
      this._loadItem(itemId);
    } else {
      this._error.set('Item ID not found');
      this._loading.set(false);
    }
  }

  private _loadItem(id: string): void {
    this._loading.set(true);
    this._error.set(null);

    this._itemService
      .getItem(id)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (item: Item) => {
          this._item.set(item);
        },
        error: (error: any) => {
          console.error('Failed to load item:', error);
          this._error.set('Failed to load item details');
          this._toastService.error({ title: 'Failed to load item details' });
        },
      });
  }

  onShare(): void {
    const item = this._item();
    if (!item) return;

    this._dialogService.create({
      zContent: ShareModalComponent,
      zData: {
        item,
      },
      zTitle: 'Share Item',
      zDescription: 'Share this item with others',
      zOkText: 'Save',
      zOkIcon: 'lucideSave',
      zCancelText: 'Cancel',
      zCancelIcon: 'lucideX',
      zOnOk: (cmp: ShareModalComponent) => {
        cmp.onOk();
        return;
      },
    });
  }

  onEdit(): void {
    const item = this._item();
    if (item) {
      this._router.navigate(['/dashboard/items/edit', item.id]);
    }
  }

  onDelete(): void {
    const item = this._item();
    if (!item) return;

    this._alertDialogService.confirm({
      zTitle: 'Delete Item',
      zContent: `Are you sure you want to delete "${item.name}"?`,
      zIcon: 'lucideTrash',
      zType: 'destructive',
      zOkDestructive: true,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOnOk: () => this._deleteItem(item.id),
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Not set';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  private _deleteItem(itemId: string): void {
    this._itemService
      .deleteItem(itemId)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: () => {
          this._toastService.success({
            title: 'Item deleted',
            message: 'Item was deleted successfully',
          });
          this._router.navigate(['/dashboard/items/list']);
        },
        error: (error: any) => {
          console.error('Failed to delete item:', error);
          this._toastService.error({ title: 'Failed to delete item', message: error });
        },
      });
  }
}
