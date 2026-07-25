import { Response } from 'express';
import { adminAnalyticsService, auditLogService, notificationService } from '../services';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';

/**
 * GET /api/admin/analytics
 * College admin views analytics for their college.
 */
export const getAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const analytics = await adminAnalyticsService.getAnalytics(req.user!.college);
    sendOk(res, 'Analytics retrieved successfully', analytics);
  }
);

/**
 * GET /api/admin/audit-logs
 * College admin views audit logs for their college.
 */
export const getAuditLogs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page, limit } = req.query;

    const result = await auditLogService.getCollegeAuditLogs(
      req.user!.college,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendOk(res, 'Audit logs retrieved successfully', result);
  }
);

/**
 * GET /api/admin/audit-logs/:entity/:entityId
 * View history for a specific entity.
 */
export const getEntityHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { entity, entityId } = req.params;
    const { page, limit } = req.query;

    const result = await auditLogService.getEntityHistory(
      entity,
      entityId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendOk(res, 'Entity history retrieved successfully', result);
  }
);

/**
 * GET /api/admin/notifications
 * Admin views their own notifications.
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
 * PATCH /api/admin/notifications/:id/read
 * Mark a notification as read.
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
 * PATCH /api/admin/notifications/read-all
 * Mark all notifications as read.
 */
export const markAllNotificationsRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const count = await notificationService.markAllAsRead(req.user!.userId);
    sendOk(res, `${count} notifications marked as read`, { markedCount: count });
  }
);
