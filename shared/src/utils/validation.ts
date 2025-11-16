import { REGEX_PATTERNS, VALIDATION_RULES } from "../constants/validation";

/**
 * Validation utility functions
 */

export const isValidEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH &&
    REGEX_PATTERNS.PASSWORD_STRONG.test(password)
  );
};

export const isValidUrl = (url: string): boolean => {
  return REGEX_PATTERNS.URL.test(url);
};

export const isValidPhone = (phone: string): boolean => {
  return REGEX_PATTERNS.PHONE.test(phone);
};

export const validateStringLength = (
  value: string,
  min: number,
  max: number
): boolean => {
  return value.length >= min && value.length <= max;
};

export const validateNumberRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};

export const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const isValidQuantity = (quantity: number): boolean => {
  return (
    Number.isInteger(quantity) &&
    quantity >= VALIDATION_RULES.ITEM_QUANTITY_MIN &&
    quantity <= VALIDATION_RULES.ITEM_QUANTITY_MAX
  );
};
