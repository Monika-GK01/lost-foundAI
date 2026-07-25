import { Router } from 'express';
import {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} from '../controllers/college.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { createCollegeSchema, updateCollegeSchema } from '../validators';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /colleges:
 *   post:
 *     tags: [Colleges]
 *     summary: Create a new college (super admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               address: { type: string }
 *     responses:
 *       201: { description: College created }
 *       403: { description: Super admin access required }
 */
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN),
  validate(createCollegeSchema),
  createCollege
);

/**
 * @swagger
 * /colleges:
 *   get:
 *     tags: [Colleges]
 *     summary: List all colleges
 *     responses:
 *       200: { description: List of colleges }
 */
router.get('/', getAllColleges);

/**
 * @swagger
 * /colleges/{id}:
 *   get:
 *     tags: [Colleges]
 *     summary: Get college by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: College details }
 *       404: { description: College not found }
 */
router.get('/:id', getCollegeById);

/**
 * @swagger
 * /colleges/{id}:
 *   put:
 *     tags: [Colleges]
 *     summary: Update a college (super admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: College updated }
 *       403: { description: Super admin access required }
 */
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN),
  validate(updateCollegeSchema),
  updateCollege
);

/**
 * @swagger
 * /colleges/{id}:
 *   delete:
 *     tags: [Colleges]
 *     summary: Delete a college (super admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: College deleted }
 *       403: { description: Super admin access required }
 */
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), deleteCollege);

export default router;
