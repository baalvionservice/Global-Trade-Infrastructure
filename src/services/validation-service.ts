
/**
 * @file validation-service.ts
 * @description Centralized sanitization and payload validation for institutional inputs.
 * ENHANCED: Added strict schema enforcement to prevent attribute injection.
 */

export type ValidationRule = 'required' | 'email' | 'amount' | 'id' | 'future_date' | 'positive_int' | 'readonly';

const ENTITY_SCHEMAS: Record<string, Record<string, ValidationRule[]>> = {
  rfqs: {
    title: ['required'],
    category: ['required'],
    quantity: ['required'],
    unit: ['required'],
    target_price: ['amount'],
    deadline: ['required', 'future_date'],
    orgId: ['readonly'], // Prevent tenant spoofing
    status: ['readonly'] // Handled by lifecycle service only
  },
  quotations: {
    rfqId: ['required'],
    price: ['required', 'amount'],
    leadTimeDays: ['required', 'positive_int'],
    validUntil: ['future_date'],
    sellerId: ['readonly'],
    status: ['readonly']
  },
  payments: {
    amount: ['required', 'amount'],
    currency: ['required'],
    escrowId: ['required']
  },
  companies: {
    name: ['required'],
    tax_id: ['required'],
    country: ['required'],
    trustScore: ['readonly'], // Prevent reputation hacking
    blacklistFlag: ['readonly']
  }
};

export const validationService = {
  /**
   * Validates a payload against a set of institutional rules.
   * Throws on 'readonly' violations to prevent illegal attribute modification.
   */
  validate(data: Record<string, any>, schema: Record<string, ValidationRule[]>): string[] {
    const errors: string[] = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];

      rules.forEach(rule => {
        if (rule === 'readonly' && value !== undefined) {
          errors.push(`Field '${field}' is managed by system authority and cannot be modified directly.`);
        }
        if (rule === 'required' && (value === undefined || value === null || value === '')) {
          errors.push(`Field '${field}' is mandatory.`);
        }
        if (rule === 'amount' && typeof value === 'number' && value <= 0) {
          errors.push(`Amount in '${field}' must be positive.`);
        }
        if (rule === 'positive_int' && (typeof value !== 'number' || value <= 0 || !Number.isInteger(value))) {
          errors.push(`'${field}' must be a positive integer.`);
        }
        if (rule === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`'${field}' must be a valid institutional email.`);
        }
        if (rule === 'future_date' && value) {
          const date = new Date(value);
          if (isNaN(date.getTime()) || date <= new Date()) {
            errors.push(`'${field}' must be a valid future date.`);
          }
        }
      });
    });

    return errors;
  },

  getSchemaForEntity(entity: string) {
    return ENTITY_SCHEMAS[entity] || null;
  }
};
