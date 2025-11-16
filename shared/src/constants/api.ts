/**
 * API-related constants
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_VERIFY_EMAIL: "/auth/verify-email",
  AUTH_RESEND_VERIFICATION: "/auth/resend-verification",
  AUTH_REQUEST_PASSWORD_RESET: "/auth/request-password-reset",
  AUTH_RESET_PASSWORD: "/auth/reset-password",

  // Users
  USERS: "/users",
  USER_BY_ID: (id: number) => `/users/${id}`,
  USER_PROFILE: "/users/profile",

  // Houses
  HOUSES: "/houses",
  HOUSE_BY_ID: (id: number) => `/houses/${id}`,
  HOUSE_ACCESS: (houseId: number) => `/houses/${houseId}/access`,
  HOUSE_INVITES: (houseId: number) => `/houses/${houseId}/invites`,

  // Rooms
  ROOMS: "/rooms",
  ROOM_BY_ID: (id: number) => `/rooms/${id}`,
  ROOM_ACCESS: (roomId: number) => `/rooms/${roomId}/access`,

  // Items
  ITEMS: "/items",
  ITEM_BY_ID: (id: number) => `/items/${id}`,
  ITEMS_BY_ROOM: (roomId: number) => `/rooms/${roomId}/items`,
  ITEMS_BY_HOUSE: (houseId: number) => `/houses/${houseId}/items`,

  // Categories
  CATEGORIES: "/categories",
  CATEGORY_BY_ID: (id: number) => `/categories/${id}`,

  // Activities
  ACTIVITIES: "/activities",
  ACTIVITY_BY_ID: (id: number) => `/activities/${id}`,

  // Maintenance
  MAINTENANCE: "/maintenance",
  MAINTENANCE_BY_ID: (id: number) => `/maintenance/${id}`,
  MAINTENANCE_BY_ITEM: (itemId: number) => `/items/${itemId}/maintenance`,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
