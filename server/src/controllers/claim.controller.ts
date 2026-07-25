import { Response } from 'express';
import { claimService } from '../services';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendOk } from '../utils/ApiResponse';

/**
 * POST /api/claims
 * Student submits a new claim.
 */
export const createClaim = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { lostItemId, foundItemId, verificationAnswers, proofImages, aiMatchScore } = req.body;

    const claim = await claimService.createClaim(
      { lostItemId, foundItemId, verificationAnswers, proofImages, aiMatchScore },
      req.user!.userId,
      req.user!.college
    );

    sendCreated(res, 'Claim submitted successfully', claim);
  }
);

/**
 * GET /api/claims/my
 * Student views their own claims.
 */
export const getMyClaims = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page, limit } = req.query;

    const result = await claimService.getStudentClaims(
      req.user!.userId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendOk(res, 'Claims retrieved successfully', result);
  }
);

/**
 * GET /api/claims/:id
 * View a single claim (student own, or admin in college).
 */
export const getClaimById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const claim = await claimService.getClaimById(req.params.id);
    sendOk(res, 'Claim retrieved successfully', claim);
  }
);

/**
 * PATCH /api/claims/:id/cancel
 * Student cancels their own pending claim.
 */
export const cancelClaim = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const claim = await claimService.cancelClaim(req.params.id, req.user!.userId);
    sendOk(res, 'Claim cancelled successfully', claim);
  }
);

/**
 * PATCH /api/claims/:id/review
 * Admin approves or rejects a claim.
 */
export const reviewClaim = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { status, adminRemarks } = req.body;

    const claim = await claimService.reviewClaim(
      req.params.id,
      { status, adminRemarks },
      req.user!.userId,
      req.user!.college
    );

    const message = status === 'APPROVED' ? 'Claim approved successfully' : 'Claim rejected';
    sendOk(res, message, claim);
  }
);

/**
 * GET /api/claims/pending
 * Admin views pending claims for their college.
 */
export const getPendingClaims = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page, limit } = req.query;

    const result = await claimService.getPendingClaims(
      req.user!.college,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendOk(res, 'Pending claims retrieved successfully', result);
  }
);

/**
 * GET /api/claims/college
 * Admin views all claims for their college with optional status filter.
 */
export const getCollegeClaims = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page, limit, status } = req.query;

    const result = await claimService.getCollegeClaims(
      req.user!.college,
      status as string,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendOk(res, 'College claims retrieved successfully', result);
  }
);
