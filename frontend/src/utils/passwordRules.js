/**
 * Password validation rules (must match backend rules in backend/utils/passwordValidator.js)
 */

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: true,
  noConsecutiveChars: 3, // no 3+ consecutive identical characters
};

/**
 * Detailed requirements message
 */
export const PASSWORD_REQUIREMENTS_TEXT = `Password must contain:
• At least 8 characters
• One uppercase letter (A-Z)
• One lowercase letter (a-z)
• One digit (0-9)
• One special character (!@#$%^&*)`;

/**
 * Check if password meets the requirements
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: array }
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_RULES.requireDigit && !/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (PASSWORD_RULES.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for 3+ consecutive identical characters
  if (new RegExp(`(.)\\1{${PASSWORD_RULES.noConsecutiveChars - 1},}`).test(password)) {
    errors.push('Password cannot contain 3 or more consecutive identical characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
