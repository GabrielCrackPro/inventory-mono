/**
 * Password utility functions for validation and requirements checking
 */

export interface PasswordRequirements {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  specialChar: boolean;
  noSpaces: boolean;
}

export class PasswordUtils {
  /**
   * Check password requirements against a given password string
   * @param password - The password to check
   * @returns Object with boolean values for each requirement
   */
  static checkRequirements(password: string = ''): PasswordRequirements {
    return {
      minLength: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noSpaces: !/\s/.test(password),
    };
  }

  /**
   * Get the strength score of a password (0-100)
   * @param password - The password to evaluate
   * @returns Strength score from 0 to 100
   */
  static getStrengthScore(password: string = ''): number {
    const requirements = this.checkRequirements(password);
    const checks = Object.values(requirements);
    const passedChecks = checks.filter(Boolean).length;

    // Base score from requirements (60% of total)
    const requirementScore = (passedChecks / checks.length) * 60;

    // Length bonus (40% of total)
    const lengthScore = Math.min((password.length / 12) * 40, 40);

    return Math.round(requirementScore + lengthScore);
  }

  /**
   * Get password strength level as a string
   * @param password - The password to evaluate
   * @returns Strength level: 'weak', 'fair', 'good', or 'strong'
   */
  static getStrengthLevel(password: string = ''): 'weak' | 'fair' | 'good' | 'strong' {
    const score = this.getStrengthScore(password);

    if (score < 25) return 'weak';
    if (score < 50) return 'fair';
    if (score < 75) return 'good';
    return 'strong';
  }

  /**
   * Check if password meets all basic requirements
   * @param password - The password to check
   * @returns True if all requirements are met
   */
  static meetsAllRequirements(password: string = ''): boolean {
    const requirements = this.checkRequirements(password);
    return Object.values(requirements).every(Boolean);
  }

  /**
   * Generate a list of missing requirements for display
   * @param password - The password to check
   * @returns Array of missing requirement descriptions
   */
  static getMissingRequirements(password: string = ''): string[] {
    const requirements = this.checkRequirements(password);
    const missing: string[] = [];

    if (!requirements.minLength) missing.push('at least 8 characters');
    if (!requirements.lowercase) missing.push('one lowercase letter');
    if (!requirements.uppercase) missing.push('one uppercase letter');
    if (!requirements.number) missing.push('one number');
    if (!requirements.specialChar) missing.push('one special character');
    if (!requirements.noSpaces) missing.push('no spaces');

    return missing;
  }
}
