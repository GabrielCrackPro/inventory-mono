import { IconName } from '@core/config';

export type ItemCondition = 'NEW' | 'USED' | 'DAMAGED';
export type ItemVisibility = 'private' | 'household' | 'public';
export type ItemUnit =
  | 'pieces'
  | 'kg'
  | 'g'
  | 'lbs'
  | 'oz'
  | 'liters'
  | 'ml'
  | 'gallons'
  | 'meters'
  | 'cm'
  | 'inches'
  | 'feet'
  | 'boxes'
  | 'bottles'
  | 'cans';

export interface Item {
  id: string;

  // General Information
  name: string;
  description?: string;
  category: any;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: ItemCondition;

  // Storage & Location
  room: any;
  location?: string;
  quantity: number;
  unit: ItemUnit;
  minStock: number;

  // Purchase Information
  purchaseDate?: Date;
  purchasePrice?: number;
  supplier?: string;
  warranty?: string;

  // Additional Details
  tags: string[];
  notes?: string;

  // Sharing & Access
  isShared: boolean;
  sharedWith: string[];
  visibility: ItemVisibility;

  // System fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  icon?: IconName;
}

// Form data interface for creating/updating items
export interface ItemFormData {
  // General Info
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  condition: ItemCondition;

  // Storage & Location
  room: string;
  location: string;
  quantity: number;
  unit: ItemUnit;
  minStock: number;

  // Purchase Info
  purchaseDate: string; // Form uses string, converted to Date in service
  price: number;
  supplier: string;
  warranty: string;

  // Additional Details
  tags: string; // Form uses comma-separated string, converted to array in service
  notes: string;

  // Sharing & Access
  isShared: boolean;
  sharedWith: string; // Form uses comma-separated string, converted to array in service
  visibility: ItemVisibility;
}

// Existing interfaces for backward compatibility
export interface RecentItem {
  id: string;
  name: string;
  room: any;
  category: any;
  quantity: number;
  addedDate: string;
  icon: IconName;
}

export interface LowStockItem {
  id: string;
  name: string;
  room: any;
  quantity: number;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: IconName;
}

// Helper functions for data transformation
export class ItemHelpers {
  /**
   * Converts form data to backend DTO format
   */
  static formDataToItem(formData: ItemFormData, userId: number | undefined): any {
    // Parse roomId from the room selection (room field contains the ID)
    const roomId = typeof formData.room === 'number' ? formData.room : parseInt(formData.room) || 0;

    return {
      // General Information
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      category: formData.category || undefined,
      brand: formData.brand?.trim() || undefined,
      model: formData.model?.trim() || undefined,
      serialNumber: formData.serialNumber?.trim() || undefined,
      condition: formData.condition,

      // Storage & Location
      room: roomId, // Send numeric Room ID to backend
      roomId: roomId,
      location: formData.location?.trim() || undefined,
      quantity: parseInt(formData.quantity.toString()) || 1,
      unit: formData.unit || 'pieces',
      minStock: formData.minStock ? parseInt(formData.minStock.toString()) : 0,

      // Purchase Information
      purchaseDate: formData.purchaseDate || undefined,
      price: formData.price ? parseFloat(formData.price.toString()) : undefined,
      supplier: formData.supplier?.trim() || undefined,
      warranty: formData.warranty?.trim() || undefined,

      // Additional Details
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [],
      notes: formData.notes?.trim() || undefined,

      // Sharing & Access
      isShared: formData.isShared || false,
      sharedWith: formData.sharedWith
        ? formData.sharedWith
            .split(',')
            .map((email) => email.trim())
            .filter((email) => email.length > 0)
        : [],
      visibility: formData.visibility || 'private',
    };
  }

  /**
   * Converts Item model to form data
   */
  static itemToFormData(item: Item): ItemFormData {
    return {
      // General Info
      name: item.name,
      description: item.description || '',
      category: item.category,
      brand: item.brand || '',
      model: item.model || '',
      serialNumber: item.serialNumber || '',
      condition: item.condition,

      // Storage & Location
      room: item.room,
      location: item.location || '',
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.minStock,

      // Purchase Info
      purchaseDate: item.purchaseDate ? item.purchaseDate.toISOString().split('T')[0] : '',
      price: (item as any).price ?? (item as any).purchasePrice ?? 0,
      supplier: item.supplier || '',
      warranty: item.warranty || '',

      // Additional Details
      tags: item.tags.join(', '),
      notes: item.notes || '',

      // Sharing & Access
      isShared: item.isShared,
      sharedWith: item.sharedWith.join(', '),
      visibility: item.visibility,
    };
  }

  /**
   * Generates a RecentItem from an Item
   */
  static itemToRecentItem(item: Item): RecentItem {
    return {
      id: item.id,
      name: item.name,
      room: item.room,
      category: item.category,
      quantity: item.quantity,
      addedDate: item.createdAt.toISOString(),
      icon: item.icon || 'Box',
    };
  }

  /**
   * Generates a LowStockItem from an Item (if quantity is below minStock)
   */
  static itemToLowStockItem(item: Item): LowStockItem | null {
    if (item.quantity <= item.minStock && item.minStock > 0) {
      return {
        id: item.id,
        name: item.name,
        room: item.room,
        quantity: item.quantity,
      };
    }
    return null;
  }
}
