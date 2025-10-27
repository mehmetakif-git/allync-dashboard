// =====================================================
// INPUT VALIDATOR UTILITY
// Comprehensive input validation for security
// =====================================================

import logger from '../services/consoleLogger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
  customErrorMessage?: string;
}

class InputValidator {
  private static instance: InputValidator;

  // Dangerous patterns that indicate XSS attempts
  private readonly dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,           // <script> tags
    /<iframe[^>]*>.*?<\/iframe>/gi,           // <iframe> tags
    /javascript:/gi,                           // javascript: protocol
    /on\w+\s*=/gi,                            // Event handlers (onclick, onerror, etc.)
    /<object[^>]*>.*?<\/object>/gi,           // <object> tags
    /<embed[^>]*>/gi,                         // <embed> tags
    /<applet[^>]*>.*?<\/applet>/gi,           // <applet> tags
    /eval\s*\(/gi,                            // eval() function
    /expression\s*\(/gi,                      // CSS expression()
    /<meta[^>]*>/gi,                          // <meta> tags
    /<link[^>]*>/gi,                          // <link> tags
    /<style[^>]*>.*?<\/style>/gi,             // <style> tags
  ];

  private constructor() {}

  public static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  // =====================================================
  // VALIDATION METHODS
  // =====================================================

  public validate(value: string, rules: ValidationRules, fieldName: string = 'Field'): ValidationResult {
    const errors: string[] = [];

    // Required check
    if (rules.required && !value?.trim()) {
      errors.push(`${fieldName} is required.`);
      return { isValid: false, errors };
    }

    // If not required and empty, skip other validations
    if (!value?.trim() && !rules.required) {
      return { isValid: true, errors: [] };
    }

    // Min length check
    if (rules.minLength && value.trim().length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters.`);
    }

    // Max length check
    if (rules.maxLength && value.trim().length > rules.maxLength) {
      errors.push(`${fieldName} must not exceed ${rules.maxLength} characters.`);
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.customErrorMessage || `${fieldName} format is invalid.`);
    }

    // Custom validator
    if (rules.customValidator && !rules.customValidator(value)) {
      errors.push(rules.customErrorMessage || `${fieldName} validation failed.`);
    }

    // XSS check
    if (this.containsDangerousContent(value)) {
      errors.push(`${fieldName} contains potentially dangerous content.`);
      logger.warn('XSS attempt detected', { fieldName, value: value.substring(0, 100) });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // =====================================================
  // XSS DETECTION
  // =====================================================

  public containsDangerousContent(value: string): boolean {
    if (!value) return false;

    // Check against all dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(value)) {
        return true;
      }
    }

    return false;
  }

  // =====================================================
  // SANITIZATION
  // =====================================================

  public sanitize(value: string): string {
    if (!value) return value;

    let sanitized = value;

    // Remove all dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Basic HTML escape for special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized.trim();
  }

  // Sanitize but allow safe HTML (for rich text)
  public sanitizeRichText(value: string): string {
    if (!value) return value;

    let sanitized = value;

    // Remove dangerous patterns but keep basic formatting
    for (const pattern of this.dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized.trim();
  }

  // =====================================================
  // SPECIFIC VALIDATORS
  // =====================================================

  public validateNotificationTitle(title: string): ValidationResult {
    return this.validate(title, {
      required: true,
      minLength: 3,
      maxLength: 255,
    }, 'Title');
  }

  public validateNotificationMessage(message: string): ValidationResult {
    return this.validate(message, {
      required: true,
      minLength: 10,
      maxLength: 2000,
    }, 'Message');
  }

  public validateEmail(email: string): ValidationResult {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.validate(email, {
      required: true,
      pattern: emailPattern,
      customErrorMessage: 'Please enter a valid email address.',
    }, 'Email');
  }

  public validateURL(url: string): ValidationResult {
    const urlPattern = /^https?:\/\/.+/;
    return this.validate(url, {
      pattern: urlPattern,
      customErrorMessage: 'Please enter a valid URL starting with http:// or https://',
    }, 'URL');
  }

  // =====================================================
  // BATCH VALIDATION
  // =====================================================

  public validateMultiple(validations: Array<{ value: string; rules: ValidationRules; fieldName: string }>): ValidationResult {
    const allErrors: string[] = [];

    for (const { value, rules, fieldName } of validations) {
      const result = this.validate(value, rules, fieldName);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const inputValidator = InputValidator.getInstance();

export default inputValidator;

// =====================================================
// USAGE EXAMPLES:
// =====================================================

/*
import inputValidator from './utils/inputValidator';

// Single field validation
const titleResult = inputValidator.validateNotificationTitle(formData.title);
if (!titleResult.isValid) {
  showError(titleResult.errors.join(' '));
  return;
}

// Multiple fields validation
const result = inputValidator.validateMultiple([
  { value: formData.title, rules: { required: true, minLength: 3, maxLength: 255 }, fieldName: 'Title' },
  { value: formData.message, rules: { required: true, minLength: 10, maxLength: 2000 }, fieldName: 'Message' },
]);

if (!result.isValid) {
  showError(result.errors.join('\n'));
  return;
}

// Sanitize user input
const cleanTitle = inputValidator.sanitize(formData.title);
const cleanMessage = inputValidator.sanitize(formData.message);
*/