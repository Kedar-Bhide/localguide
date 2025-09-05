import { ValidationError } from '@/types';

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate full name
   */
  static isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }
  
  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Validate city name
   */
  static isValidCity(city: string): boolean {
    const cityRegex = /^[a-zA-Z\s\-',.]+$/;
    return city.length >= 2 && city.length <= 100 && cityRegex.test(city);
  }
  
  /**
   * Validate country name
   */
  static isValidCountry(country: string): boolean {
    const countryRegex = /^[a-zA-Z\s\-',.]+$/;
    return country.length >= 2 && country.length <= 100 && countryRegex.test(country);
  }
  
  /**
   * Validate tags array
   */
  static validateTags(tags: string[]): boolean {
    if (tags.length > 10) return false;
    
    return tags.every(tag => 
      tag.length >= 2 && 
      tag.length <= 50 && 
      /^[a-zA-Z0-9\s\-_]+$/.test(tag)
    );
  }
  
  /**
   * Format validation errors for API response
   */
  static formatValidationErrors(errors: ValidationError[]): string {
    return errors.map(error => `${error.field}: ${error.message}`).join(', ');
  }
  
  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: number, limit?: number): { page: number; limit: number } {
    const validPage = Math.max(1, Math.floor(page || 1));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit || 20)));
    
    return { page: validPage, limit: validLimit };
  }
  
  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}