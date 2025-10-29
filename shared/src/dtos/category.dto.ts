/**
 * Category creation DTO
 */
export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * Category update DTO
 */
export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * Category response DTO
 */
export interface CategoryResponseDto {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  itemCount?: number;
}

/**
 * Category list response DTO
 */
export interface CategoryListResponseDto {
  data: CategoryResponseDto[];
  total: number;
}
