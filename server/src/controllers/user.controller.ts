import { Response } from 'express';
import { userService } from '../services';
import { trustScoreService } from '../services/trustScore.service';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk, sendNoContent } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { ROLES } from '../constants';

/** Attach computed trustTier to a user response object */
function withTrustTier<T extends { trustScore: number }>(user: T): T & { trustTier: string } {
  return { ...user, trustTier: trustScoreService.getTrustTier(user.trustScore).label };
}

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await userService.getProfile(req.user!.userId);
    sendOk(res, 'Profile retrieved successfully', withTrustTier(user.toObject() as any));
  }
);

export const getAllUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;

    // Super admin sees all, others see only their college
    const collegeId =
      req.user!.role === ROLES.SUPER_ADMIN ? null : req.user!.college;

    const result = await userService.getAllUsers(collegeId, page, limit);
    const data = result.data.map((u: any) => withTrustTier(u.toObject ? u.toObject() : u));
    sendOk(res, 'Users retrieved successfully', { ...result, data });
  }
);

export const getUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await userService.getUserById(req.params.id);
    sendOk(res, 'User retrieved successfully', withTrustTier(user.toObject() as any));
  }
);

export const updateUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const isSelf = req.user!.userId === req.params.id;
    const isAdmin =
      req.user!.role === ROLES.SUPER_ADMIN ||
      req.user!.role === ROLES.COLLEGE_ADMIN;

    let updated;
    if (isAdmin && !isSelf) {
      updated = await userService.adminUpdateUser(req.params.id, req.body);
    } else {
      updated = await userService.updateUser(req.params.id, req.body);
    }

    sendOk(res, 'User updated successfully', updated);
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await userService.deleteUser(req.params.id);
    sendNoContent(res, 'User deleted successfully');
  }
);

export const setUserStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.user!.userId === req.params.id) {
      throw ApiError.badRequest('You cannot change your own account status');
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      throw ApiError.badRequest('isActive must be a boolean');
    }

    const updated = await userService.updateUserStatus(req.params.id, isActive);
    sendOk(res, isActive ? 'User enabled' : 'User disabled', updated);
  }
);
