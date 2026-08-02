import mongoose from 'mongoose';
import { claimRepository } from '../repositories/claim.repository';
import { lostItemRepository } from '../repositories/lostItem.repository';
import { foundItemRepository } from '../repositories/foundItem.repository';
import { trustScoreService } from './trustScore.service';
import { notificationService } from './notification.service';
import { auditLogService } from './auditLog.service';
import { ApiError } from '../utils/ApiError';
import { CLAIM_STATUS, ITEM_STATUS, AUDIT_ACTIONS, PAGINATION } from '../constants';
import { IClaim, IVerificationAnswer } from '../models';
import { logger } from '../utils/logger';

export interface CreateClaimInput {
  lostItemId: string;
  foundItemId: string;
  verificationAnswers: IVerificationAnswer[];
  proofImages?: string[];
  aiMatchScore?: number;
}

export interface ReviewClaimInput {
  status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
  adminRemarks?: string;
}

export class ClaimService {
  /**
   * Student submits a claim for a matched lost/found item pair.
   */
  async createClaim(
    input: CreateClaimInput,
    studentId: string,
    collegeId: string
  ): Promise<IClaim> {
    // Validate items exist
    const lostItem = await lostItemRepository.findById(input.lostItemId);
    if (!lostItem) {
      throw ApiError.notFound('Lost item not found');
    }

    const foundItem = await foundItemRepository.findById(input.foundItemId);
    if (!foundItem) {
      throw ApiError.notFound('Found item not found');
    }

    // Ensure items are still open
    if (lostItem.status !== ITEM_STATUS.LOST.OPEN) {
      throw ApiError.badRequest('This lost item is no longer open for claims');
    }
    if (foundItem.status !== ITEM_STATUS.FOUND.OPEN) {
      throw ApiError.badRequest('This found item is no longer open for claims');
    }

    // Prevent duplicate active claims for same pair by same user
    const duplicate = await claimRepository.existsForItems(
      input.lostItemId,
      input.foundItemId
    );
    if (duplicate) {
      throw ApiError.conflict('An active claim already exists for this item pair');
    }

    const claim = await claimRepository.create({
      student: new mongoose.Types.ObjectId(studentId),
      lostItem: new mongoose.Types.ObjectId(input.lostItemId),
      foundItem: new mongoose.Types.ObjectId(input.foundItemId),
      college: new mongoose.Types.ObjectId(collegeId),
      verificationAnswers: input.verificationAnswers,
      proofImages: input.proofImages || [],
      aiMatchScore: input.aiMatchScore || 0,
      status: CLAIM_STATUS.PENDING,
    });

    // Notification
    await notificationService.notifyClaimSubmitted(studentId, lostItem.title);

    // Audit log
    await auditLogService.log({
      performedBy: studentId,
      action: AUDIT_ACTIONS.CLAIM_CREATED,
      entity: 'Claim',
      entityId: claim._id.toString(),
      college: collegeId,
      newValue: { status: CLAIM_STATUS.PENDING, lostItem: input.lostItemId, foundItem: input.foundItemId },
    });

    logger.info(`Claim created: ${claim._id} by student ${studentId}`);
    return claim;
  }

  /**
   * Get all claims for a student.
   */
  async getStudentClaims(studentId: string, page?: number, limit?: number) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { claims, total } = await claimRepository.findByStudent(studentId, p, l);

    return {
      data: claims,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  /**
   * Get a single claim by ID.
   */
  async getClaimById(id: string): Promise<IClaim> {
    const claim = await claimRepository.findById(id);
    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }
    return claim;
  }

  /**
   * Student cancels their own pending claim.
   */
  async cancelClaim(claimId: string, studentId: string): Promise<IClaim> {
    const claim = await claimRepository.findById(claimId);
    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    if (claim.student.toString() !== studentId) {
      throw ApiError.forbidden('You can only cancel your own claims');
    }

    if (![CLAIM_STATUS.PENDING, CLAIM_STATUS.UNDER_REVIEW, CLAIM_STATUS.NEEDS_REVIEW].includes(claim.status as never)) {
      throw ApiError.badRequest('Only pending or under-review claims can be cancelled');
    }

    const updated = await claimRepository.update(claimId, {
      status: CLAIM_STATUS.CANCELLED,
    });

    if (!updated) {
      throw ApiError.internal('Failed to cancel claim');
    }

    // Audit log
    await auditLogService.log({
      performedBy: studentId,
      action: AUDIT_ACTIONS.CLAIM_CANCELLED,
      entity: 'Claim',
      entityId: claimId,
      college: claim.college.toString(),
      oldValue: { status: claim.status },
      newValue: { status: CLAIM_STATUS.CANCELLED },
    });

    return updated;
  }

  /**
   * Admin reviews a claim: approve or reject.
   * On approval → triggers recovery workflow + trust score update.
   * On rejection → trust score penalty + notification.
   */
  async reviewClaim(
    claimId: string,
    input: ReviewClaimInput,
    adminId: string,
    adminCollege: string
  ): Promise<IClaim> {
    const claim = await claimRepository.findById(claimId);
    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    // College isolation: admin can only review claims in their college
    if (claim.college.toString() !== adminCollege) {
      throw ApiError.forbidden('You can only review claims within your college');
    }

    // Prevent reviewing already resolved claims
    if ([CLAIM_STATUS.APPROVED, CLAIM_STATUS.REJECTED, CLAIM_STATUS.CANCELLED].includes(claim.status as never)) {
      throw ApiError.badRequest(`Claim has already been ${claim.status.toLowerCase()}`);
    }

    const now = new Date();

    if (input.status === 'APPROVED') {
      return this.approveClaim(claim, adminId, input.adminRemarks || '', now);
    }

    if (input.status === 'NEEDS_REVIEW') {
      return this.flagNeedsReview(claim, adminId, input.adminRemarks || '', now);
    }

    return this.rejectClaim(claim, adminId, input.adminRemarks || '', now);
  }

  /**
   * Admin marks an approved claim as physically recovered.
   * Idempotent: ensures item statuses are RETURNED/CLAIMED and re-notifies student.
   */
  async recoverClaim(
    claimId: string,
    adminId: string,
    adminCollege: string
  ): Promise<IClaim> {
    const claim = await claimRepository.findById(claimId);
    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    if (claim.college.toString() !== adminCollege) {
      throw ApiError.forbidden('You can only manage claims within your college');
    }

    if (claim.status !== CLAIM_STATUS.APPROVED) {
      throw ApiError.badRequest('Only approved claims can be marked as recovered');
    }

    const now = new Date();

    const updated = await claimRepository.update(claimId, {
      recoveryTimestamp: claim.recoveryTimestamp || now,
    });

    if (!updated) {
      throw ApiError.internal('Failed to update claim recovery');
    }

    // Ensure item statuses reflect recovery
    await lostItemRepository.update(claim.lostItem.toString(), {
      status: ITEM_STATUS.LOST.RETURNED,
    });
    await foundItemRepository.update(claim.foundItem.toString(), {
      status: ITEM_STATUS.FOUND.CLAIMED,
    });

    await notificationService.notifyItemRecovered(
      claim.student.toString(),
      'your claimed item'
    );

    // Trust score: reward student for physical recovery
    await trustScoreService.adjustScore(claim.student.toString(), 'ITEM_RECOVERED');

    // Trust score: reward finder for successful found submission
    const foundItemForRecovery = await foundItemRepository.findById(claim.foundItem.toString());
    if (foundItemForRecovery) {
      await trustScoreService.adjustScore(foundItemForRecovery.finder.toString(), 'FOUND_ITEM_VERIFIED');
    }

    await auditLogService.log({
      performedBy: adminId,
      action: AUDIT_ACTIONS.ITEM_RECOVERED,
      entity: 'Claim',
      entityId: claimId,
      college: claim.college.toString(),
      oldValue: { recoveryTimestamp: claim.recoveryTimestamp },
      newValue: { recoveryTimestamp: (claim.recoveryTimestamp || now).toISOString() },
    });

    logger.info(`Claim ${claimId} marked recovered by admin ${adminId}`);
    return updated;
  }

  /**
   * Get pending claims for a college (admin view).
   */
  async getPendingClaims(collegeId: string, page?: number, limit?: number) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { claims, total } = await claimRepository.findPendingByCollege(collegeId, p, l);

    return {
      data: claims,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  /**
   * Get all claims for a college with optional status filter.
   */
  async getCollegeClaims(
    collegeId: string,
    status?: string,
    page?: number,
    limit?: number
  ) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { claims, total } = await claimRepository.findAll(
      { college: collegeId, status },
      p,
      l
    );

    return {
      data: claims,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────

  private async approveClaim(
    claim: IClaim,
    adminId: string,
    remarks: string,
    now: Date
  ): Promise<IClaim> {
    // Generate pickup details
    const verificationCode = `LF-${Math.floor(1000 + Math.random() * 9000)}`;
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    // Skip weekends
    if (nextDay.getDay() === 0) nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay.getDay() === 6) nextDay.setDate(nextDay.getDate() + 2);
    const pickupTime = `${nextDay.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, 10:00 AM - 4:00 PM`;

    const pickupDetails = {
      office: 'Student Affairs Office',
      building: 'Block A',
      room: '105',
      contactPerson: 'Campus Admin',
      pickupTime,
      verificationCode,
    };

    // Update claim status with pickup details
    const updated = await claimRepository.update(claim._id.toString(), {
      status: CLAIM_STATUS.APPROVED,
      adminRemarks: remarks,
      reviewedBy: new mongoose.Types.ObjectId(adminId),
      reviewedAt: now,
      recoveryTimestamp: now,
      pickupDetails,
    });

    if (!updated) {
      throw ApiError.internal('Failed to approve claim');
    }

    // Recovery workflow: update item statuses
    await lostItemRepository.update(claim.lostItem.toString(), {
      status: ITEM_STATUS.LOST.RETURNED,
    });
    await foundItemRepository.update(claim.foundItem.toString(), {
      status: ITEM_STATUS.FOUND.CLAIMED,
    });

    // Trust score: reward the student
    await trustScoreService.adjustScore(claim.student.toString(), 'APPROVED_CLAIM');

    // Notifications
    const studentId = claim.student.toString();
    await notificationService.notifyClaimApproved(studentId, 'your claimed item', verificationCode);

    // Notify finder that item was recovered
    const foundItem = await foundItemRepository.findById(claim.foundItem.toString());
    if (foundItem) {
      await notificationService.notifyItemRecovered(
        foundItem.finder.toString(),
        foundItem.title
      );
    }

    // Audit log
    await auditLogService.log({
      performedBy: adminId,
      action: AUDIT_ACTIONS.CLAIM_APPROVED,
      entity: 'Claim',
      entityId: claim._id.toString(),
      college: claim.college.toString(),
      oldValue: { status: claim.status },
      newValue: { status: CLAIM_STATUS.APPROVED, remarks, recoveryTimestamp: now.toISOString() },
    });

    await auditLogService.log({
      performedBy: adminId,
      action: AUDIT_ACTIONS.ITEM_RECOVERED,
      entity: 'LostItem',
      entityId: claim.lostItem.toString(),
      college: claim.college.toString(),
      oldValue: { status: ITEM_STATUS.LOST.OPEN },
      newValue: { status: ITEM_STATUS.LOST.RETURNED },
    });

    logger.info(`Claim ${claim._id} approved by admin ${adminId}`);
    return updated;
  }

  private async flagNeedsReview(
    claim: IClaim,
    adminId: string,
    remarks: string,
    now: Date
  ): Promise<IClaim> {
    const updated = await claimRepository.update(claim._id.toString(), {
      status: CLAIM_STATUS.NEEDS_REVIEW,
      adminRemarks: remarks,
      reviewedBy: new mongoose.Types.ObjectId(adminId),
      reviewedAt: now,
    });

    if (!updated) {
      throw ApiError.internal('Failed to flag claim for manual review');
    }

    await auditLogService.log({
      performedBy: adminId,
      action: AUDIT_ACTIONS.CLAIM_REVIEWED,
      entity: 'Claim',
      entityId: claim._id.toString(),
      college: claim.college.toString(),
      oldValue: { status: claim.status },
      newValue: { status: CLAIM_STATUS.NEEDS_REVIEW, remarks },
    });

    logger.info(`Claim ${claim._id} flagged for manual review by admin ${adminId}`);
    return updated;
  }

  private async rejectClaim(
    claim: IClaim,
    adminId: string,
    remarks: string,
    now: Date
  ): Promise<IClaim> {
    const updated = await claimRepository.update(claim._id.toString(), {
      status: CLAIM_STATUS.REJECTED,
      adminRemarks: remarks,
      reviewedBy: new mongoose.Types.ObjectId(adminId),
      reviewedAt: now,
    });

    if (!updated) {
      throw ApiError.internal('Failed to reject claim');
    }

    // Trust score: penalize for false claim
    await trustScoreService.adjustScore(claim.student.toString(), 'FALSE_CLAIM');

    // Additional penalty if admin remarks indicate fraud
    const lowerRemarks = remarks.toLowerCase();
    if (lowerRemarks.includes('fraudulent') || lowerRemarks.includes('fake')) {
      await trustScoreService.adjustScore(claim.student.toString(), 'REJECTED_SPAM');
    }

    // Notification
    await notificationService.notifyClaimRejected(
      claim.student.toString(),
      'your claimed item',
      remarks
    );

    // Audit log
    await auditLogService.log({
      performedBy: adminId,
      action: AUDIT_ACTIONS.CLAIM_REJECTED,
      entity: 'Claim',
      entityId: claim._id.toString(),
      college: claim.college.toString(),
      oldValue: { status: claim.status },
      newValue: { status: CLAIM_STATUS.REJECTED, remarks },
    });

    logger.info(`Claim ${claim._id} rejected by admin ${adminId}`);
    return updated;
  }
}

export const claimService = new ClaimService();
