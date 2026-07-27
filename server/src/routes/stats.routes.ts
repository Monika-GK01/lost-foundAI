import { Router } from 'express';
import { getPublicStats } from '../controllers/stats.controller';

const router = Router();

/**
 * @swagger
 * /stats/public:
 *   get:
 *     tags: [Stats]
 *     summary: Get public platform statistics (no auth)
 *     responses:
 *       200: { description: Public statistics }
 */
router.get('/public', getPublicStats);

export default router;
