import { Request } from 'express';
import { UserRole } from '../constants';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  college: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
