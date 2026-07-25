import { Router } from 'express';
import {
  createClaim,
  getMyClaims,
  getClaimById,
  cancelClaim,
  reviewClaim,
  getPendingClaims,
  getCollegeClaims,
} from '../controllers/claim.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { createClaimSchema, reviewClaimSchema } from '../validators/claim.validator';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);

// Student routes
router.post('/', validate(createClaimSchema), createClaim);
router.get('/my', getMyClaims);
router.get('/pending', authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN), getPendingClaims);
router.get('/college', authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN), getCollegeClaims);
router.get('/:id', getClaimById);
router.patch('/:id/cancel', cancelClaim);
router.patch(
  '/:id/review',
  authorize(ROLES.COLLEGE_ADMIN, ROLES.SUPER_ADMIN),
  validate(reviewClaimSchema),
  reviewClaim
);

export default router;
