import { Router } from 'express';
import authRoutes from './auth.routes';
import collegeRoutes from './college.routes';
import userRoutes from './user.routes';
import lostItemRoutes from './lostItem.routes';
import foundItemRoutes from './foundItem.routes';
import claimRoutes from './claim.routes';
import adminRoutes from './admin.routes';
import statsRoutes from './stats.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/users', userRoutes);
router.use('/lost-items', lostItemRoutes);
router.use('/found-items', foundItemRoutes);
router.use('/claims', claimRoutes);
router.use('/admin', adminRoutes);
router.use('/stats', statsRoutes);
router.use('/notifications', notificationRoutes);

export default router;
