/**
 * Base category interface
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

/**
 * Category with related data
 */
export interface CategoryWithRelations extends Category {
  items?: any[];
  itemCount?: number;
}

/**
 * Category creation data
 */
export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * Category update data
 */
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * Category statistics
 */
export interface CategoryStats {
  id: number;
  name: string;
  itemCount: number;
  totalValue: number;
  lowStockItems: number;
}
