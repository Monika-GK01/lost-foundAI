import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get current user's notifications
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated notifications with unreadCount }
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     responses:
 *       200: { description: Unread count }
 */
router.get('/unread-count', getUnreadCount);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200: { description: All notifications marked read }
 */
router.patch('/read-all', markAllNotificationsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification marked read }
 */
router.patch('/:id/read', markNotificationRead);

export default router;
