import { Router } from 'express';
import authRoutes from './auth.routes';
import collegeRoutes from './college.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/users', userRoutes);

export default router;
