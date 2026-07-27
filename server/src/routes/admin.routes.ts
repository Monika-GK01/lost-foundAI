import { Router } from 'express';
import {
  getAnalytics,
  getAuditLogs,
  getEntityHistory,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/admin.controller';
import { getReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN));

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get college analytics dashboard data
 *     responses:
 *       200: { description: Analytics data (items, claims, recovery rates) }
 *       403: { description: Admin access required }
 */
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Generate an exportable report (JSON preview or CSV download)
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [lost, found, recovered, claims] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv] }
 *     responses:
 *       200: { description: Report data or CSV file }
 *       403: { description: Admin access required }
 */
router.get('/reports', getReport);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get audit logs (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated audit logs }
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @swagger
 * /admin/audit-logs/{entity}/{entityId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get audit history for a specific entity
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Entity audit history }
 */
router.get('/audit-logs/:entity/:entityId', getEntityHistory);

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin notifications
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: unread
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Paginated notifications }
 */
router.get('/notifications', getNotifications);

/**
 * @swagger
 * /admin/notifications/read-all:
 *   patch:
 *     tags: [Admin]
 *     summary: Mark all notifications as read
 *     responses:
 *       200: { description: All notifications marked read }
 */
router.patch('/notifications/read-all', markAllNotificationsRead);

/**
 * @swagger
 * /admin/notifications/{id}/read:
 *   patch:
 *     tags: [Admin]
 *     summary: Mark a single notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification marked read }
 */
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
