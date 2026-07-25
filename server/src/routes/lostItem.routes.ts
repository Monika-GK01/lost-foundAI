import { Router } from 'express';
import {
  createLostItem,
  getAllLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
  getLostItemMatches,
} from '../controllers/lostItem.controller';
import { authenticate, collegeIsolation, validate } from '../middlewares';
import { createLostItemSchema, updateLostItemSchema } from '../validators/lostItem.validator';
import { uploadSingle } from '../utils/upload';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  uploadSingle('image'),
  validate(createLostItemSchema),
  createLostItem
);
router.get('/', collegeIsolation, getAllLostItems);
router.get('/:id', collegeIsolation, getLostItemById);
router.put(
  '/:id',
  collegeIsolation,
  validate(updateLostItemSchema),
  updateLostItem
);
router.delete('/:id', collegeIsolation, deleteLostItem);
router.get('/:id/matches', collegeIsolation, getLostItemMatches);

export default router;
