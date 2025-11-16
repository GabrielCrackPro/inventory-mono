// Re-export validation utilities from shared package
export {
  isValidEmail,
  isStrongPassword,
  isValidUrl,
  isValidPhone,
  validateStringLength,
  validateNumberRange,
  sanitizeString,
  isValidDate,
  isValidQuantity,
} from '@inventory/shared';

// Re-export validation constants
export { VALIDATION_RULES, VALIDATION_MESSAGES, REGEX_PATTERNS } from '@inventory/shared';
