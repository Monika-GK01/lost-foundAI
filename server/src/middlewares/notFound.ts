import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/ApiResponse';

export const notFound = (req: AuthenticatedRequest, res: Response): void => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};
