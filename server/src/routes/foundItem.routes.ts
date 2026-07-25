import { Router } from 'express';
import {
  createFoundItem,
  getAllFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem,
} from '../controllers/foundItem.controller';
import { authenticate, collegeIsolation, validate } from '../middlewares';
import { createFoundItemSchema, updateFoundItemSchema } from '../validators/foundItem.validator';
import { uploadSingle } from '../utils/upload';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  uploadSingle('image'),
  validate(createFoundItemSchema),
  createFoundItem
);
router.get('/', collegeIsolation, getAllFoundItems);
router.get('/:id', collegeIsolation, getFoundItemById);
router.put(
  '/:id',
  collegeIsolation,
  validate(updateFoundItemSchema),
  updateFoundItem
);
router.delete('/:id', collegeIsolation, deleteFoundItem);

export default router;
