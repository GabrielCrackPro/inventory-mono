import { HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { ProfileService } from '@features/user';
import { HouseService } from '@features/house';
import { Observable, switchMap, of } from 'rxjs';
import { Item, ItemFormData, ItemHelpers, LowStockItem, RecentItem } from '../models/item';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private _apiService = inject(ApiService);
  private _profileService = inject(ProfileService);
  private _houseService = inject(HouseService);

  userId = computed(() => this._profileService.getProfile()?.id);

  /**
   * Creates a new item from form data
   */
  addItem(formData: ItemFormData): Observable<Item> {
    const selectedHouse = this._houseService.getSelectedHouse();

    if (selectedHouse) {
      return selectedHouse.pipe(
        switchMap((house) => {
          const itemData = ItemHelpers.formDataToItem(formData, this.userId());
          // Add houseId to the payload
          itemData.houseId = house?.id || 1;
          return this._apiService.post<Item, any>('items', itemData);
        })
      );
    } else {
      // Fallback if no house is selected
      const itemData = ItemHelpers.formDataToItem(formData, this.userId());
      itemData.houseId = 1;
      return this._apiService.post<Item, any>('items', itemData);
    }
  }

  /**
   * Updates an existing item
   */
  updateItem(id: string, formData: ItemFormData): Observable<Item> {
    const itemData = ItemHelpers.formDataToItem(formData, this.userId());
    return this._apiService.patch<Item, any>('items', id, itemData);
  }

  /**
   * Gets a single item by ID
   */
  getItem(id: string): Observable<Item> {
    return this._apiService.getOne<Item>('items', id);
  }

  /**
   * Gets all items with optional filtering
   */
  getItems(filters?: {
    category?: string;
    room?: string;
    lowStock?: boolean;
    search?: string;
  }): Observable<Item[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.append('category', filters.category);
    if (filters?.room) params = params.append('room', filters.room);
    if (filters?.lowStock) params = params.append('lowStock', 'true');
    if (filters?.search) params = params.append('search', filters.search);

    return this._apiService.get<Item[]>('items', params);
  }

  /**
   * Deletes an item
   */
  deleteItem(id: string): Observable<void> {
    return this._apiService.delete<void>('items', id);
  }

  deleteMultipleItems(ids: string[]): Observable<void> {
    return this._apiService.post<any, string[]>('deleteMultipleItems', ids);
  }

  /**
   * Gets items with low stock (using existing endpoint)
   */
  getLowStock(): Observable<LowStockItem[]> {
    return this._apiService.get<LowStockItem[]>('lowStockItems');
  }

  /**
   * Gets recently added items (using existing endpoint)
   */
  getRecent(limit: number = 10): Observable<RecentItem[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this._apiService.get<RecentItem[]>('recentItems', params);
  }

  /**
   * Updates item quantity (for quick stock adjustments)
   */
  updateQuantity(id: string, quantity: number): Observable<Item> {
    return this._apiService.patch<Item, { quantity: number }>('items', id, { quantity });
  }

  /**
   * Gets item statistics (using existing stats endpoint)
   */
  getItemStats(): Observable<{
    totalItems: number;
    lowStockItems: number;
    categoriesCount: Record<string, number>;
    roomsCount: Record<string, number>;
  }> {
    return this._apiService.get('stats');
  }

  /**
   * Converts form data to the format expected by the API
   */
  prepareFormData(formData: ItemFormData): any {
    return ItemHelpers.formDataToItem(formData, this.userId());
  }

  /**
   * Converts API item data to form data for editing
   */
  prepareEditData(item: Item): ItemFormData {
    return ItemHelpers.itemToFormData(item);
  }
}
