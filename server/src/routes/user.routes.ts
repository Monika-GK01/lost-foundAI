import { Router } from 'express';
import {
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, authorize, collegeIsolation, validate } from '../middlewares';
import { updateUserSchema } from '../validators';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN),
  collegeIsolation,
  getAllUsers
);
router.get('/:id', collegeIsolation, getUserById);
router.put('/:id', collegeIsolation, validate(updateUserSchema), updateUser);
router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN),
  collegeIsolation,
  deleteUser
);

export default router;
