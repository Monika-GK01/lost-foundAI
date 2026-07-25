import { Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/ApiResponse';

export const validate = (schema: ZodSchema) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        sendError(res, 400, 'Validation failed', JSON.stringify(messages));
        return;
      }
      next(error);
    }
  };
};
