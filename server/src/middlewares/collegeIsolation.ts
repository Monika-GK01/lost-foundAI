import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';
import { ROLES } from '../constants';

/**
 * College Isolation Middleware
 * Ensures multi-tenancy:
 * - SUPER_ADMIN bypasses all restrictions
 * - COLLEGE_ADMIN can only access data within their college
 * - STUDENT can only access data within their college
 */
export const collegeIsolation = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }

  // Super admin bypasses college isolation
  if (req.user.role === ROLES.SUPER_ADMIN) {
    next();
    return;
  }

  // For routes with :id param that references a college, validate access
  const targetCollege = req.params.collegeId || req.body?.college;

  if (targetCollege && targetCollege !== req.user.college) {
    next(ApiError.forbidden('You can only access data within your college'));
    return;
  }

  next();
};

/**
 * Attaches the user's college to the request query for filtering.
 * Used in list endpoints to automatically scope data.
 */
export const scopeToCollege = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }

  // Super admin sees everything
  if (req.user.role === ROLES.SUPER_ADMIN) {
    next();
    return;
  }

  // Attach college filter to query
  req.query.college = req.user.college;
  next();
};
