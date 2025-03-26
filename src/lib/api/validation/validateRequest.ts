import { ValidationError } from "../middleware/withErrorHandling";

/**
 * Validates a request body against a schema
 * @param body The request body to validate
 * @param schema The schema to validate against
 * @throws ValidationError if validation fails
 * @returns The validated body
 */
export function validateRequest<T>(
  body: unknown,
  schema: {
    validate: (data: unknown) => { error?: { message: string }; value: T };
  }
): T {
  const { error, value } = schema.validate(body);
  
  if (error) {
    throw new ValidationError(error.message);
  }
  
  return value;
}

/**
 * Simple validation for required fields
 * @param body The object to validate
 * @param requiredFields Array of field names that are required
 * @throws ValidationError if any required field is missing
 * @returns The validated body
 */
export function validateRequiredFields<T>(
  body: T,
  requiredFields: (keyof T)[]
): T {
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new ValidationError(`Field '${String(field)}' is required`);
    }
  }
  
  return body;
}

/**
 * Validates that a value is a string
 * @param value The value to validate
 * @param fieldName The name of the field (for error messages)
 * @throws ValidationError if the value is not a string
 * @returns The validated string
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`Field '${fieldName}' must be a string`);
  }
  
  return value;
}

/**
 * Validates that a value is a number
 * @param value The value to validate
 * @param fieldName The name of the field (for error messages)
 * @throws ValidationError if the value is not a number
 * @returns The validated number
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`Field '${fieldName}' must be a number`);
  }
  
  return value;
}

/**
 * Validates that a value is a boolean
 * @param value The value to validate
 * @param fieldName The name of the field (for error messages)
 * @throws ValidationError if the value is not a boolean
 * @returns The validated boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`Field '${fieldName}' must be a boolean`);
  }
  
  return value;
}