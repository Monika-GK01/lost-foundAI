import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '../constants';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden('You do not have permission to perform this action'));
      return;
    }

    next();
  };
};
