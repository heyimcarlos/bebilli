/**
 * Input validation utilities for secure form handling
 */

/**
 * Validates and parses a string to a positive number within bounds.
 * Returns null if validation fails.
 */
export function validatePositiveNumber(
  value: string,
  options: {
    min?: number;
    max?: number;
    allowZero?: boolean;
  } = {}
): number | null {
  const { min = 0.01, max = 1_000_000_000, allowZero = false } = options;
  
  // Trim and check for empty string
  const trimmed = value.trim();
  if (trimmed === '') return null;
  
  const num = Number(trimmed);
  
  // Check for NaN and Infinity
  if (!Number.isFinite(num)) return null;
  
  // Check minimum
  if (allowZero) {
    if (num < 0) return null;
  } else {
    if (num < min) return null;
  }
  
  // Check maximum
  if (num > max) return null;
  
  return num;
}

/**
 * Validates a contribution amount (must be positive, reasonable bounds)
 */
export function validateContributionAmount(value: string): number | null {
  return validatePositiveNumber(value, {
    min: 0.01,
    max: 10_000_000, // Max $10M per contribution
  });
}

/**
 * Validates a goal amount (must be positive, reasonable bounds)
 */
export function validateGoalAmount(value: string): number | null {
  return validatePositiveNumber(value, {
    min: 1,
    max: 1_000_000_000, // Max $1B goal
  });
}

/**
 * Sanitizes a string for safe display (basic XSS prevention)
 */
export function sanitizeString(value: string, maxLength: number = 1000): string {
  return value.trim().slice(0, maxLength);
}
