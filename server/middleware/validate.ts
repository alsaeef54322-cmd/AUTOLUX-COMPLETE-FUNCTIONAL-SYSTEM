import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError.ts';

export interface FieldRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (val: any) => string | null; // returns error message if invalid
}

export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    const body = req.body || {};

    for (const field of fields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missing.join(', ')}`,
        missing.map((f) => ({ field: f, message: `${f} is required` }))
      );
    }

    next();
  };
}

export function validateBody(rules: FieldRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string }> = [];
    const body = req.body || {};

    for (const rule of rules) {
      const val = body[rule.field];

      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      if (val !== undefined && val !== null) {
        if (rule.type) {
          if (rule.type === 'array' && !Array.isArray(val)) {
            errors.push({ field: rule.field, message: `${rule.field} must be an array` });
          } else if (rule.type !== 'array' && typeof val !== rule.type) {
            errors.push({ field: rule.field, message: `${rule.field} must be a ${rule.type}` });
          }
        }

        if (rule.min !== undefined) {
          if (typeof val === 'number' && val < rule.min) {
            errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min}` });
          } else if (typeof val === 'string' && val.length < rule.min) {
            errors.push({ field: rule.field, message: `${rule.field} must have at least ${rule.min} characters` });
          }
        }

        if (rule.max !== undefined) {
          if (typeof val === 'number' && val > rule.max) {
            errors.push({ field: rule.field, message: `${rule.field} cannot exceed ${rule.max}` });
          } else if (typeof val === 'string' && val.length > rule.max) {
            errors.push({ field: rule.field, message: `${rule.field} cannot exceed ${rule.max} characters` });
          }
        }

        if (rule.enum && !rule.enum.includes(val)) {
          errors.push({ field: rule.field, message: `${rule.field} must be one of: ${rule.enum.join(', ')}` });
        }

        if (rule.custom) {
          const customError = rule.custom(val);
          if (customError) {
            errors.push({ field: rule.field, message: customError });
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(
        `Validation failed on ${errors.length} field(s)`,
        errors
      );
    }

    next();
  };
}
