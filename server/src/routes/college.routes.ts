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

router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN),
  validate(createCollegeSchema),
  createCollege
);
router.get('/', getAllColleges);
router.get('/:id', getCollegeById);
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN),
  validate(updateCollegeSchema),
  updateCollege
);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), deleteCollege);

export default router;
