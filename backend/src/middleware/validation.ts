import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ValidationUtils } from '@/utils/validation';
import { ApiResponse } from '@/types';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array().map(error => ({
        field: error.type === 'field' ? (error as any).path : 'unknown',
        message: error.msg
      }))
    };
    
    res.status(400).json(response);
    return;
  }
  
  next();
};

// Authentication validation rules
export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('full_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-',.]+$/)
    .withMessage('Full name can only contain letters, spaces, and common punctuation'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Profile validation rules
export const validateProfileUpdate = [
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  body('city')
    .optional()
    .custom((value) => {
      if (value && !ValidationUtils.isValidCity(value)) {
        throw new Error('Invalid city name');
      }
      return true;
    }),
  
  body('country')
    .optional()
    .custom((value) => {
      if (value && !ValidationUtils.isValidCountry(value)) {
        throw new Error('Invalid country name');
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
    .custom((tags) => {
      if (tags && !ValidationUtils.validateTags(tags)) {
        throw new Error('Invalid tags format');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Local expert validation rules
export const validateLocalExpertProfile = [
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .custom((value) => {
      if (!ValidationUtils.isValidCity(value)) {
        throw new Error('Invalid city name');
      }
      return true;
    }),
  
  body('country')
    .notEmpty()
    .withMessage('Country is required')
    .custom((value) => {
      if (!ValidationUtils.isValidCountry(value)) {
        throw new Error('Invalid country name');
      }
      return true;
    }),
  
  body('bio')
    .isLength({ min: 50, max: 1000 })
    .withMessage('Bio must be between 50 and 1000 characters'),
  
  body('tags')
    .isArray({ min: 1, max: 10 })
    .withMessage('Please select 1-10 expertise tags')
    .custom((tags) => {
      if (!ValidationUtils.validateTags(tags)) {
        throw new Error('Invalid tags format');
      }
      return true;
    }),
  
  body('languages')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 languages allowed'),
  
  handleValidationErrors
];

// Search validation rules
export const validateSearch = [
  query('location')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  query('city')
    .optional()
    .custom((value) => {
      if (value && !ValidationUtils.isValidCity(value)) {
        throw new Error('Invalid city name');
      }
      return true;
    }),
  
  query('country')
    .optional()
    .custom((value) => {
      if (value && !ValidationUtils.isValidCountry(value)) {
        throw new Error('Invalid country name');
      }
      return true;
    }),
  
  query('tags')
    .optional()
    .custom((value) => {
      if (value) {
        const tags = typeof value === 'string' ? value.split(',') : value;
        if (!Array.isArray(tags) || !ValidationUtils.validateTags(tags)) {
          throw new Error('Invalid tags format');
        }
      }
      return true;
    }),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Chat validation rules
export const validateChatMessage = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  
  body('message_type')
    .optional()
    .isIn(['text', 'image', 'location'])
    .withMessage('Invalid message type'),
  
  handleValidationErrors
];

// Parameter validation rules
export const validateUUIDParam = (paramName: string) => [
  param(paramName)
    .custom((value) => {
      if (!ValidationUtils.isValidUUID(value)) {
        throw new Error(`Invalid ${paramName} format`);
      }
      return true;
    }),
  
  handleValidationErrors
];