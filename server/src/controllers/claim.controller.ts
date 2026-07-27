import { Response } from 'express';
import { claimService } from '../services';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendOk } from '../utils/ApiResponse';
import { generateRecoveryQR } from '../utils/qrGenerator';
import { ApiError } from '../utils/ApiError';

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

    const message =
      status === 'APPROVED'
        ? 'Claim approved successfully'
        : status === 'NEEDS_REVIEW'
        ? 'Claim flagged for manual review'
        : 'Claim rejected';
    sendOk(res, message, claim);
  }
);

/**
 * PATCH /api/claims/:id/recover
 * Admin marks an approved claim as physically recovered.
 */
export const recoverClaim = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const claim = await claimService.recoverClaim(
      req.params.id,
      req.user!.userId,
      req.user!.college
    );

    sendOk(res, 'Claim marked as recovered', claim);
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

/**
 * GET /api/claims/:id/recovery-receipt
 * Generates a QR recovery receipt for an approved claim.
 */
export const getRecoveryReceipt = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const claim = await claimService.getClaimById(req.params.id);

    if (claim.status !== 'APPROVED') {
      throw new ApiError(400, 'Recovery receipt is only available for approved claims');
    }

    const qrDataUrl = await generateRecoveryQR({
      recoveryId: claim._id.toString(),
      itemId: (claim.foundItem as any)?._id?.toString() || claim.foundItem?.toString() || '',
      studentName: (claim.student as any)?.name || 'Student',
      recoveryDate: claim.recoveryTimestamp
        ? new Date(claim.recoveryTimestamp).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      adminName: (claim.reviewedBy as any)?.name || 'Admin',
      status: claim.status,
    });

    sendOk(res, 'Recovery receipt generated', {
      qrCode: qrDataUrl,
      recoveryId: claim._id.toString(),
      status: claim.status,
      recoveryDate: claim.recoveryTimestamp || claim.reviewedAt,
    });
  }
);
