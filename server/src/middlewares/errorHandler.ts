import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/ApiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message, err.isOperational ? undefined : err.stack);
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    sendError(res, 409, `Duplicate value for field: ${field}`);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors || {}).map(
      (e: any) => e.message
    );
    sendError(res, 400, 'Validation failed', messages.join(', '));
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, 400, 'Invalid ID format');
    return;
  }

  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });

  sendError(
    res,
    500,
    env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error',
    env.NODE_ENV === 'production' ? undefined : err.stack
  );
};
