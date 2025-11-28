/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (@$!%*?&)
 * 
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validatePassword = (password) => {
  const errors = [];

  // Check if password exists
  if (!password) {
    return {
      isValid: false,
      errors: ["Password is required"],
    };
  }

  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  // Check for digit
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one digit (0-9)");
  }

  // Check for special character
  if (!/[@$!%*?&]/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)");
  }

  // Check for common weak patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password cannot contain more than 2 consecutive identical characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Gets a user-friendly password requirement message
 * @returns {string} - Formatted requirements message
 */
const getPasswordRequirements = () => {
  return `Password must meet these requirements:
  • Minimum 8 characters
  • At least one uppercase letter (A-Z)
  • At least one lowercase letter (a-z)
  • At least one digit (0-9)
  • At least one special character (@$!%*?&)
  • No more than 2 consecutive identical characters`;
};

module.exports = {
  validatePassword,
  getPasswordRequirements,
};
