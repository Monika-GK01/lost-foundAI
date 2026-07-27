import { Router } from 'express';
import {
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  setUserStatus,
} from '../controllers/user.controller';
import { authenticate, authorize, collegeIsolation, validate } from '../middlewares';
import { updateUserSchema } from '../validators';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user's profile
 *     responses:
 *       200: { description: User profile data }
 *       401: { description: Not authenticated }
 */
router.get('/me', getProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated user list }
 *       403: { description: Admin access required }
 */
router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN),
  collegeIsolation,
  getAllUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User details }
 *       404: { description: User not found }
 */
router.get('/:id', collegeIsolation, getUserById);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Enable or disable a user account (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Updated user }
 *       403: { description: Admin access required }
 */
router.patch(
  '/:id/status',
  authorize(ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN),
  collegeIsolation,
  setUserStatus
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Updated user }
 *       403: { description: Not authorized }
 */
router.put('/:id', collegeIsolation, validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User deleted }
 *       403: { description: Admin access required }
 */
router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN),
  collegeIsolation,
  deleteUser
);

export default router;
