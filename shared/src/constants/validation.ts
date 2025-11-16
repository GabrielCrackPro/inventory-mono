/**
 * Validation constants used across the application
 */

export const VALIDATION_RULES = {
  // User validation
  USER_NAME_MIN_LENGTH: 2,
  USER_NAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Item validation
  ITEM_NAME_MIN_LENGTH: 1,
  ITEM_NAME_MAX_LENGTH: 200,
  ITEM_DESCRIPTION_MAX_LENGTH: 2000,
  ITEM_QUANTITY_MIN: 0,
  ITEM_QUANTITY_MAX: 999999,

  // House validation
  HOUSE_NAME_MIN_LENGTH: 1,
  HOUSE_NAME_MAX_LENGTH: 200,
  HOUSE_ADDRESS_MAX_LENGTH: 500,

  // Room validation
  ROOM_NAME_MIN_LENGTH: 1,
  ROOM_NAME_MAX_LENGTH: 100,
  ROOM_DESCRIPTION_MAX_LENGTH: 1000,

  // Category validation
  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_NAME_MAX_LENGTH: 100,

  // Maintenance validation
  MAINTENANCE_TITLE_MIN_LENGTH: 1,
  MAINTENANCE_TITLE_MAX_LENGTH: 200,
  MAINTENANCE_DESCRIPTION_MAX_LENGTH: 2000,
} as const;

export const VALIDATION_MESSAGES = {
  // Common
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_DATE: "Please enter a valid date",

  // User
  USER_NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.USER_NAME_MIN_LENGTH} characters`,
  USER_NAME_TOO_LONG: `Name must not exceed ${VALIDATION_RULES.USER_NAME_MAX_LENGTH} characters`,
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password must not exceed ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`,
  PASSWORD_WEAK:
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",

  // Item
  ITEM_NAME_REQUIRED: "Item name is required",
  ITEM_QUANTITY_INVALID: "Quantity must be a positive number",

  // House
  HOUSE_NAME_REQUIRED: "House name is required",

  // Room
  ROOM_NAME_REQUIRED: "Room name is required",

  // Category
  CATEGORY_NAME_REQUIRED: "Category name is required",
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  PHONE: /^\+?[\d\s\-()]+$/,
  URL: /^https?:\/\/.+/,
} as const;
