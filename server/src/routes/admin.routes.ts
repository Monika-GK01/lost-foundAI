import { Router } from 'express';
import {
  getAnalytics,
  getAuditLogs,
  getEntityHistory,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN));

// Analytics
router.get('/analytics', getAnalytics);

// Audit logs
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/:entity/:entityId', getEntityHistory);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
