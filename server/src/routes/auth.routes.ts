import { Router } from 'express';
import { register, login, logout, refresh, changePassword } from '../controllers/auth.controller';
import { validate, authenticate, authRateLimiter } from '../middlewares';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role, college]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [STUDENT, COLLEGE_ADMIN] }
 *               college: { type: string }
 *               studentId: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error }
 *       409: { description: Email already exists }
 */
router.post('/register', authRateLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, sets httpOnly cookies }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authRateLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and clear session cookies
 *     responses:
 *       200: { description: Logged out successfully }
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change the current user's password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Password changed successfully }
 *       400: { description: Current password incorrect or validation error }
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token cookie
 *     security: []
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Invalid or expired refresh token }
 */
router.post('/refresh', refresh);

export default router;
