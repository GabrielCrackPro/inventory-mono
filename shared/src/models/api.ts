/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Search parameters
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

/**
 * API endpoints configuration
 */
export interface ApiEndpoints {
  // Auth endpoints
  login: string;
  register: string;
  refresh: string;
  logout: string;

  // User endpoints
  users: string;
  profile: string;

  // House endpoints
  houses: string;

  // Room endpoints
  rooms: string;

  // Item endpoints
  items: string;

  // Activity endpoints
  activity: string;

  // Category endpoints
  categories: string;
}

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}
