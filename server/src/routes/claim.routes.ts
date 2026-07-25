import { Router } from 'express';
import {
  createClaim,
  getMyClaims,
  getClaimById,
  cancelClaim,
  reviewClaim,
  getPendingClaims,
  getCollegeClaims,
  getRecoveryReceipt,
} from '../controllers/claim.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { createClaimSchema, reviewClaimSchema } from '../validators/claim.validator';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /claims:
 *   post:
 *     tags: [Claims]
 *     summary: Submit a new claim for a found item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lostItemId, foundItemId, verificationAnswers]
 *             properties:
 *               lostItemId: { type: string }
 *               foundItemId: { type: string }
 *               verificationAnswers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question: { type: string }
 *                     answer: { type: string }
 *     responses:
 *       201: { description: Claim submitted }
 *       400: { description: Validation error }
 */
router.post('/', validate(createClaimSchema), createClaim);

/**
 * @swagger
 * /claims/my:
 *   get:
 *     tags: [Claims]
 *     summary: Get current user's claims
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of user's claims }
 */
router.get('/my', getMyClaims);

/**
 * @swagger
 * /claims/pending:
 *   get:
 *     tags: [Claims]
 *     summary: Get pending claims (admin only)
 *     responses:
 *       200: { description: List of pending claims }
 *       403: { description: Admin access required }
 */
router.get('/pending', authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN), getPendingClaims);

/**
 * @swagger
 * /claims/college:
 *   get:
 *     tags: [Claims]
 *     summary: Get all claims for the college (admin only)
 *     responses:
 *       200: { description: List of college claims }
 *       403: { description: Admin access required }
 */
router.get('/college', authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN), getCollegeClaims);

/**
 * @swagger
 * /claims/{id}:
 *   get:
 *     tags: [Claims]
 *     summary: Get claim details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Claim details with populated references }
 *       404: { description: Claim not found }
 */
router.get('/:id', getClaimById);

/**
 * @swagger
 * /claims/{id}/cancel:
 *   patch:
 *     tags: [Claims]
 *     summary: Cancel a pending claim
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Claim cancelled }
 *       400: { description: Claim cannot be cancelled }
 */
router.patch('/:id/cancel', cancelClaim);

/**
 * @swagger
 * /claims/{id}/review:
 *   patch:
 *     tags: [Claims]
 *     summary: Review a claim - approve or reject (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: [APPROVE, REJECT] }
 *               remarks: { type: string }
 *     responses:
 *       200: { description: Claim reviewed }
 *       403: { description: Admin access required }
 */
router.patch(
  '/:id/review',
  authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN),
  validate(reviewClaimSchema),
  reviewClaim
);

/**
 * @swagger
 * /claims/{id}/recovery-receipt:
 *   get:
 *     tags: [Claims]
 *     summary: Get QR recovery receipt for an approved claim
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: QR code data URL and recovery details }
 *       400: { description: Claim is not approved }
 */
router.get('/:id/recovery-receipt', getRecoveryReceipt);

export default router;
