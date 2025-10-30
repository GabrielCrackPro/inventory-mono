import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Collection of custom form validators for common use cases
 */
export class FormValidators {
  /**
   * Validates a person's name
   * - Required field
   * - 2-50 characters
   * - Only letters, spaces, hyphens, and apostrophes
   */
  static name(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { required: true };

      if (value.length < 2) {
        return { minLength: { requiredLength: 2, actualLength: value.length } };
      }

      if (value.length > 50) {
        return { maxLength: { requiredLength: 50, actualLength: value.length } };
      }

      if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        return { invalidName: true };
      }

      return null;
    };
  }

  /**
   * Validates email address
   * - Required field
   * - Valid email format
   * - Maximum 254 characters (RFC 5321 limit)
   */
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { required: true };

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return { invalidEmail: true };
      }

      if (value.length > 254) {
        return { maxLength: { requiredLength: 254, actualLength: value.length } };
      }

      return null;
    };
  }

  /**
   * Validates strong password
   * - Required field
   * - 8-128 characters
   * - At least one lowercase letter
   * - At least one uppercase letter
   * - At least one number
   * - At least one special character
   * - No spaces allowed
   */
  static password(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };

      const errors: ValidationErrors = {};

      if (value.length < 8) {
        errors['minLength'] = { requiredLength: 8, actualLength: value.length };
      }

      if (value.length > 128) {
        errors['maxLength'] = { requiredLength: 128, actualLength: value.length };
      }

      if (!/[a-z]/.test(value)) {
        errors['lowercase'] = true;
      }

      if (!/[A-Z]/.test(value)) {
        errors['uppercase'] = true;
      }

      if (!/\d/.test(value)) {
        errors['number'] = true;
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors['specialChar'] = true;
      }

      if (/\s/.test(value)) {
        errors['noSpaces'] = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  /**
   * Validates that password and confirm password fields match
   * Should be used as a form-level validator
   *
   * @param passwordFieldName - Name of the password field (default: 'password')
   * @param confirmPasswordFieldName - Name of the confirm password field (default: 'confirmPassword')
   */
  static passwordMatch(
    passwordFieldName: string = 'password',
    confirmPasswordFieldName: string = 'confirmPassword'
  ): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const password = form.get(passwordFieldName)?.value;
      const confirmPassword = form.get(confirmPasswordFieldName)?.value;

      if (!password || !confirmPassword) return null;

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  /**
   * Validates phone number (basic validation)
   * - Required field
   * - 10-15 digits
   * - Optional country code with +
   */
  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { required: true };

      // Remove all non-digit characters except +
      const cleanValue = value.replace(/[^\d+]/g, '');

      // Check for valid phone number pattern
      const phoneRegex = /^(\+\d{1,3})?[\d]{10,15}$/;
      if (!phoneRegex.test(cleanValue)) {
        return { invalidPhone: true };
      }

      return null;
    };
  }

  /**
   * Validates URL
   * - Required field
   * - Valid URL format
   */
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { required: true };

      try {
        new URL(value);
        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }

  /**
   * Validates simple password (for login forms)
   * - Required field
   * - Minimum length only (no complexity requirements)
   */
  static simplePassword(minLength: number = 1): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };

      if (value.length < minLength) {
        return { minLength: { requiredLength: minLength, actualLength: value.length } };
      }

      return null;
    };
  }

  /**
   * Validates minimum age
   * - Required field
   * - Must be at least the specified age
   */
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };

      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        const actualAge = age - 1;
        if (actualAge < minAge) {
          return { minAge: { requiredAge: minAge, actualAge } };
        }
      } else if (age < minAge) {
        return { minAge: { requiredAge: minAge, actualAge: age } };
      }

      return null;
    };
  }

  /**
   * Validates item name
   * - Required field
   * - 2-100 characters
   * - Letters, numbers, spaces, and common punctuation
   */
  static itemName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { required: true };

      if (value.length < 2) {
        return { minLength: { requiredLength: 2, actualLength: value.length } };
      }

      if (value.length > 100) {
        return { maxLength: { requiredLength: 100, actualLength: value.length } };
      }

      // Allow letters, numbers, spaces, and common punctuation
      if (!/^[a-zA-Z0-9\s\-_.,()&]+$/.test(value)) {
        return { invalidItemName: true };
      }

      return null;
    };
  }

  /**
   * Validates quantity
   * - Required field
   * - Must be a positive number
   * - Maximum reasonable quantity
   */
  static quantity(maxQuantity: number = 999999): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return { required: true };
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { invalidNumber: true };
      }

      if (numValue < 0) {
        return { min: { min: 0, actual: numValue } };
      }

      if (numValue === 0) {
        return { zeroQuantity: true };
      }

      if (numValue > maxQuantity) {
        return { max: { max: maxQuantity, actual: numValue } };
      }

      // Check for reasonable decimal places (max 3 for fractional quantities)
      if (numValue % 1 !== 0) {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        if (decimalPlaces > 3) {
          return { maxDecimalPlaces: { max: 3, actual: decimalPlaces } };
        }
      }

      return null;
    };
  }

  /**
   * Validates minimum stock level
   * - Optional field
   * - Must be a non-negative number if provided
   * - Should be less than current quantity
   */
  static minStock(maxStock: number = 999999): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Optional field - empty is valid
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { invalidNumber: true };
      }

      if (numValue < 0) {
        return { min: { min: 0, actual: numValue } };
      }

      if (numValue > maxStock) {
        return { max: { max: maxStock, actual: numValue } };
      }

      return null;
    };
  }

  /**
   * Validates that minimum stock is less than current quantity
   * Should be used as a form-level validator
   */
  static minStockLessThanQuantity(
    quantityFieldName: string = 'quantity',
    minStockFieldName: string = 'minStock'
  ): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const quantity = form.get(quantityFieldName)?.value;
      const minStock = form.get(minStockFieldName)?.value;

      // Skip validation if either field is empty or invalid
      if (!quantity || !minStock) return null;

      const quantityNum = Number(quantity);
      const minStockNum = Number(minStock);

      if (isNaN(quantityNum) || isNaN(minStockNum)) return null;

      return minStockNum >= quantityNum ? { minStockTooHigh: true } : null;
    };
  }

  /**
   * Validates room selection
   * - Required field
   * - Must be a non-empty string
   */
  static room(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { required: true };

      return null;
    };
  }

  /**
   * Validates unit selection
   * - Required field
   * - Must be from predefined list
   */
  static unit(validUnits: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { required: true };

      if (!validUnits.includes(value)) {
        return { invalidUnit: { validUnits, actual: value } };
      }

      return null;
    };
  }

  /**
   * Validates location description
   * - Optional field
   * - Maximum 200 characters
   * - Basic text validation
   */
  static location(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();

      // Optional field - empty is valid
      if (!value) return null;

      if (value.length > 200) {
        return { maxLength: { requiredLength: 200, actualLength: value.length } };
      }

      // Allow letters, numbers, spaces, and common punctuation
      if (!/^[a-zA-Z0-9\s\-_.,()&/]+$/.test(value)) {
        return { invalidLocation: true };
      }

      return null;
    };
  }

  /**
   * Validates price/cost
   * - Optional field
   * - Must be a positive number if provided
   * - Maximum 2 decimal places for currency
   */
  static price(maxPrice: number = 999999.99): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Optional field - empty is valid
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { invalidNumber: true };
      }

      if (numValue < 0) {
        return { min: { min: 0, actual: numValue } };
      }

      if (numValue > maxPrice) {
        return { max: { max: maxPrice, actual: numValue } };
      }

      // Check for maximum 2 decimal places for currency
      if (numValue % 1 !== 0) {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        if (decimalPlaces > 2) {
          return { maxDecimalPlaces: { max: 2, actual: decimalPlaces } };
        }
      }

      return null;
    };
  }

  /**
   * Validates quantity based on unit type for more contextual validation
   * - Different max quantities for different unit types
   * - Different decimal place restrictions
   */
  static smartQuantity(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control.parent;
      if (!form) return FormValidators.quantity()(control);

      const unit = form.get('unit')?.value;
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return { required: true };
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { invalidNumber: true };
      }

      if (numValue <= 0) {
        return { zeroQuantity: true };
      }

      // Unit-specific validation
      const unitConfig = {
        pieces: { maxQuantity: 999999, maxDecimals: 0 },
        boxes: { maxQuantity: 99999, maxDecimals: 0 },
        bottles: { maxQuantity: 99999, maxDecimals: 0 },
        cans: { maxQuantity: 99999, maxDecimals: 0 },
        kg: { maxQuantity: 99999, maxDecimals: 3 },
        g: { maxQuantity: 999999, maxDecimals: 1 },
        lbs: { maxQuantity: 99999, maxDecimals: 2 },
        oz: { maxQuantity: 999999, maxDecimals: 2 },
        liters: { maxQuantity: 99999, maxDecimals: 2 },
        ml: { maxQuantity: 999999, maxDecimals: 0 },
        gallons: { maxQuantity: 9999, maxDecimals: 2 },
        meters: { maxQuantity: 99999, maxDecimals: 2 },
        cm: { maxQuantity: 999999, maxDecimals: 1 },
        inches: { maxQuantity: 999999, maxDecimals: 1 },
        feet: { maxQuantity: 99999, maxDecimals: 2 },
      };

      const config = unitConfig[unit as keyof typeof unitConfig] || {
        maxQuantity: 999999,
        maxDecimals: 3,
      };

      if (numValue > config.maxQuantity) {
        return { max: { max: config.maxQuantity, actual: numValue } };
      }

      // Check decimal places based on unit
      if (numValue % 1 !== 0) {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        if (decimalPlaces > config.maxDecimals) {
          return { maxDecimalPlaces: { max: config.maxDecimals, actual: decimalPlaces } };
        }
      }

      return null;
    };
  }
}
