import { Router } from 'express';
import {
  createLostItem,
  getAllLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
  getLostItemMatches,
  checkDuplicates,
} from '../controllers/lostItem.controller';
import { authenticate, collegeIsolation, validate } from '../middlewares';
import { createLostItemSchema, updateLostItemSchema } from '../validators/lostItem.validator';
import { uploadMultiple } from '../utils/upload';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /lost-items:
 *   post:
 *     tags: [Lost Items]
 *     summary: Report a new lost item
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category, dateLost]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               brand: { type: string }
 *               color: { type: string }
 *               location: { type: string }
 *               dateLost: { type: string, format: date }
 *               reward: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Lost item created }
 *       400: { description: Validation error }
 */
router.post(
  '/',
  uploadMultiple('images', 5),
  validate(createLostItemSchema),
  createLostItem
);

/**
 * @swagger
 * /lost-items:
 *   get:
 *     tags: [Lost Items]
 *     summary: List all lost items (paginated, filtered)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of lost items }
 */
router.get('/', collegeIsolation, getAllLostItems);

/**
 * @swagger
 * /lost-items/{id}:
 *   get:
 *     tags: [Lost Items]
 *     summary: Get a lost item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lost item details }
 *       404: { description: Item not found }
 */
router.get('/:id', collegeIsolation, getLostItemById);

/**
 * @swagger
 * /lost-items/{id}:
 *   put:
 *     tags: [Lost Items]
 *     summary: Update a lost item
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
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               status: { type: string }
 *     responses:
 *       200: { description: Updated lost item }
 *       403: { description: Not authorized }
 */
router.put(
  '/:id',
  collegeIsolation,
  validate(updateLostItemSchema),
  updateLostItem
);

/**
 * @swagger
 * /lost-items/{id}:
 *   delete:
 *     tags: [Lost Items]
 *     summary: Delete a lost item (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item deleted }
 *       404: { description: Item not found }
 */
router.delete('/:id', collegeIsolation, deleteLostItem);

/**
 * @swagger
 * /lost-items/{id}/matches:
 *   get:
 *     tags: [Lost Items]
 *     summary: Get AI match results for a lost item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: topK
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Ranked list of matching found items with scores }
 */
router.get('/:id/matches', collegeIsolation, getLostItemMatches);

/**
 * @swagger
 * /lost-items/check-duplicates:
 *   post:
 *     tags: [Lost Items]
 *     summary: Check for potential duplicate lost items before creating
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category]
 *             properties:
 *               title: { type: string }
 *               category: { type: string }
 *               brand: { type: string }
 *               color: { type: string }
 *               dateLost: { type: string, format: date }
 *     responses:
 *       200: { description: List of potential duplicates with similarity scores }
 */
router.post('/check-duplicates', checkDuplicates);

export default router;
