import { Request, Response } from 'express';
import { LostItem, FoundItem, User } from '../models';
import { ITEM_STATUS } from '../constants';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';

/**
 * Public statistics for the landing page. No authentication required.
 */
export const getPublicStats = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const [lostItems, foundItems, recovered, activeUsers] = await Promise.all([
      LostItem.countDocuments({ isDeleted: false }).exec(),
      FoundItem.countDocuments({ isDeleted: false }).exec(),
      LostItem.countDocuments({ isDeleted: false, status: ITEM_STATUS.LOST.RETURNED }).exec(),
      User.countDocuments({ isActive: true }).exec(),
    ]);

    sendOk(res, 'Public statistics retrieved', {
      lostItems,
      foundItems,
      recovered,
      activeUsers,
    });
  }
);

