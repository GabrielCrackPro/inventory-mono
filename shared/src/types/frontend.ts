/**
 * Frontend-specific types that extend shared models
 */

import { Item, ItemCondition } from "../models/item";

/**
 * Item unit types for frontend display
 */
export type ItemUnit =
  | "pieces"
  | "kg"
  | "g"
  | "lbs"
  | "oz"
  | "liters"
  | "ml"
  | "gallons"
  | "meters"
  | "cm"
  | "inches"
  | "feet"
  | "boxes"
  | "bottles"
  | "cans";

/**
 * Item form data for frontend forms
 */
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
  purchaseDate: string;
  price: number;
  supplier: string;
  warranty: string;

  // Additional Details
  tags: string;
  notes: string;

  // Sharing & Access
  isShared: boolean;
  sharedWith: string;
  visibility: "private" | "shared" | "public";
}

/**
 * Recent item display
 */
export interface RecentItem {
  id: string;
  name: string;
  room: any;
  category: any;
  quantity: number;
  addedDate: string;
  icon?: string;
}

/**
 * Low stock item display
 */
export interface LowStockItem {
  id: string;
  name: string;
  room: any;
  quantity: number;
  category: any;
  unit: ItemUnit;
}

/**
 * Dashboard widget types
 */
export type DashboardWidgetId =
  | "stats"
  | "recent"
  | "stock"
  | "activity"
  | "graph";

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  enabled: boolean;
  order: number;
}

export interface DashboardLayoutConfig {
  widgets: DashboardWidgetConfig[];
}

/**
 * Dashboard data
 */
export interface DashboardData {
  activities: any[];
  recentItems: RecentItem[];
  lowStockItems: LowStockItem[];
  stats: {
    totalItems: number;
    totalRooms: number;
    totalCategories: number;
    lowStockCount: number;
  };
}

/**
 * Table column definition
 */
export interface TableCol {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

/**
 * Table column action
 */
export interface TableColAction {
  key: string;
  icon: string;
  label?: string;
}

/**
 * Password requirements for validation display
 */
export interface PasswordRequirements {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special?: boolean;
}
