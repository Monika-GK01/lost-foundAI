import { Response } from 'express';
import { userService } from '../services';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk, sendNoContent } from '../utils/ApiResponse';
import { ROLES } from '../constants';

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await userService.getProfile(req.user!.userId);
    sendOk(res, 'Profile retrieved successfully', user);
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
    sendOk(res, 'Users retrieved successfully', result);
  }
);

export const getUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await userService.getUserById(req.params.id);
    sendOk(res, 'User retrieved successfully', user);
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
