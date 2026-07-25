import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';
import { COOKIE_NAMES } from '../constants';

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token =
      req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN] ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired access token'));
    }
  }
};
