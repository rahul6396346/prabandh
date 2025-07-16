export type ValidationError = {
  field: string;
  message: string;
};

type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

const required: ValidationRule = {
  validate: (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return value !== 0; // Consider 0 as empty for school ID
    return false;
  },
  message: 'This field is required'
};

export function validateFormData<T extends Record<string, any>>(
  data: T, 
  requiredFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (!required.validate(value)) {
      errors.push({
        field: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
        message: required.message
      });
    }
  }

  return errors;
}