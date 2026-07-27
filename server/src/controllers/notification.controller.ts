import { Response } from 'express';
import { notificationService } from '../services';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';

/**
 * GET /api/notifications
 * Current user's notifications (paginated).
 */
export const getNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page, limit } = req.query;

    const result = await notificationService.getUserNotifications(
      req.user!.userId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendOk(res, 'Notifications retrieved successfully', result);
  }
);

/**
 * GET /api/notifications/unread-count
 * Lightweight unread count for the navbar badge.
 */
export const getUnreadCount = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const unreadCount = await notificationService.getUnreadCount(req.user!.userId);
    sendOk(res, 'Unread count retrieved successfully', { unreadCount });
  }
);

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
export const markNotificationRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user!.userId
    );
    sendOk(res, 'Notification marked as read', notification);
  }
);

/**
 * PATCH /api/notifications/read-all
 * Mark all of the current user's notifications as read.
 */
export const markAllNotificationsRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const count = await notificationService.markAllAsRead(req.user!.userId);
    sendOk(res, `${count} notifications marked as read`, { markedCount: count });
  }
);
