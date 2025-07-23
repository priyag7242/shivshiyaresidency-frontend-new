// Temporary validation utilities to replace express-validator
// This is a simplified implementation for development purposes

export const body = (field: string) => {
  return {
    notEmpty: () => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    isEmail: () => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    isLength: (options: any) => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    isNumeric: () => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    isInt: (options: any) => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    isIn: (values: any[]) => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    isMobilePhone: (locale: string) => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    matches: (pattern: RegExp) => ({ withMessage: (msg: string) => (req: any, res: any, next: any) => next() }),
    withMessage: (msg: string) => (req: any, res: any, next: any) => next()
  };
};

export const validationResult = (req: any) => {
  return {
    isEmpty: () => true,
    array: () => []
  };
};