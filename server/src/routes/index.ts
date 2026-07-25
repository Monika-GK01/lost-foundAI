import { Router } from 'express';
import authRoutes from './auth.routes';
import collegeRoutes from './college.routes';
import userRoutes from './user.routes';
import lostItemRoutes from './lostItem.routes';
import foundItemRoutes from './foundItem.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/users', userRoutes);
router.use('/lost-items', lostItemRoutes);
router.use('/found-items', foundItemRoutes);

export default router;
