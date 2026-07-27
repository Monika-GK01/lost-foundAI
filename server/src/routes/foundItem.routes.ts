import { Router } from 'express';
import {
  createFoundItem,
  getAllFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem,
  checkDuplicates,
} from '../controllers/foundItem.controller';
import { authenticate, collegeIsolation, validate } from '../middlewares';
import { createFoundItemSchema, updateFoundItemSchema } from '../validators/foundItem.validator';
import { uploadMultiple } from '../utils/upload';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /found-items:
 *   post:
 *     tags: [Found Items]
 *     summary: Report a new found item
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category, dateFound]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               brand: { type: string }
 *               color: { type: string }
 *               location: { type: string }
 *               dateFound: { type: string, format: date }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Found item created }
 *       400: { description: Validation error }
 */
router.post(
  '/',
  uploadMultiple('images', 5),
  validate(createFoundItemSchema),
  createFoundItem
);

/**
 * @swagger
 * /found-items:
 *   get:
 *     tags: [Found Items]
 *     summary: List all found items (paginated, filtered)
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
 *       200: { description: Paginated list of found items }
 */
router.get('/', collegeIsolation, getAllFoundItems);

/**
 * @swagger
 * /found-items/{id}:
 *   get:
 *     tags: [Found Items]
 *     summary: Get a found item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Found item details }
 *       404: { description: Item not found }
 */
router.get('/:id', collegeIsolation, getFoundItemById);

/**
 * @swagger
 * /found-items/{id}:
 *   put:
 *     tags: [Found Items]
 *     summary: Update a found item
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
 *       200: { description: Updated found item }
 *       403: { description: Not authorized }
 */
router.put(
  '/:id',
  collegeIsolation,
  validate(updateFoundItemSchema),
  updateFoundItem
);

/**
 * @swagger
 * /found-items/{id}:
 *   delete:
 *     tags: [Found Items]
 *     summary: Delete a found item (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item deleted }
 *       404: { description: Item not found }
 */
router.delete('/:id', collegeIsolation, deleteFoundItem);

/**
 * @swagger
 * /found-items/check-duplicates:
 *   post:
 *     tags: [Found Items]
 *     summary: Check for potential duplicate found items before creating
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
 *               dateFound: { type: string, format: date }
 *     responses:
 *       200: { description: List of potential duplicates with similarity scores }
 */
router.post('/check-duplicates', checkDuplicates);

export default router;
