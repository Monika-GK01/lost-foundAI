import mongoose from 'mongoose';
import { notificationRepository } from '../repositories/notification.repository';
import { userRepository } from '../repositories/user.repository';
import { NOTIFICATION_TYPE, PAGINATION } from '../constants';
import { INotification } from '../models';
import { logger } from '../utils/logger';
import { emailService } from './email.service';

export interface CreateNotificationInput {
  recipient: string;
  title: string;
  message: string;
  type: (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
}

export class NotificationService {
  async create(input: CreateNotificationInput): Promise<INotification> {
    const notification = await notificationRepository.create({
      recipient: new mongoose.Types.ObjectId(input.recipient),
      title: input.title,
      message: input.message,
      type: input.type,
    });

    logger.info(`Notification created: [${input.type}] → ${input.recipient}`);
    return notification;
  }

  async getUserNotifications(
    recipientId: string,
    page?: number,
    limit?: number
  ) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { notifications, total, unreadCount } =
      await notificationRepository.findByRecipient(recipientId, p, l);

    return {
      data: notifications,
      total,
      unreadCount,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async markAsRead(id: string, recipientId: string): Promise<INotification | null> {
    return notificationRepository.markAsRead(id, recipientId);
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    return notificationRepository.markAllAsRead(recipientId);
  }

  // ─── Convenience helpers for claim workflow ───────────────────────────

  async notifyClaimSubmitted(studentId: string, itemTitle: string): Promise<void> {
    await this.create({
      recipient: studentId,
      title: 'Claim Submitted',
      message: `Your claim for "${itemTitle}" has been submitted and is pending review.`,
      type: NOTIFICATION_TYPE.CLAIM_SUBMITTED,
    });
    const user = await userRepository.findById(studentId);
    if (user) emailService.sendClaimSubmitted(user.email, user.name, user.name, itemTitle);
  }

  async notifyClaimApproved(studentId: string, itemTitle: string): Promise<void> {
    await this.create({
      recipient: studentId,
      title: 'Claim Approved',
      message: `Your claim for "${itemTitle}" has been approved. The item is now marked as recovered.`,
      type: NOTIFICATION_TYPE.CLAIM_APPROVED,
    });
    const user = await userRepository.findById(studentId);
    if (user) emailService.sendClaimApproved(user.email, user.name, itemTitle);
  }

  async notifyClaimRejected(studentId: string, itemTitle: string, remarks: string): Promise<void> {
    await this.create({
      recipient: studentId,
      title: 'Claim Rejected',
      message: `Your claim for "${itemTitle}" has been rejected.${remarks ? ` Remarks: ${remarks}` : ''}`,
      type: NOTIFICATION_TYPE.CLAIM_REJECTED,
    });
    const user = await userRepository.findById(studentId);
    if (user) emailService.sendClaimRejected(user.email, user.name, itemTitle, remarks);
  }

  async notifyItemRecovered(finderId: string, itemTitle: string): Promise<void> {
    await this.create({
      recipient: finderId,
      title: 'Item Recovered',
      message: `The found item "${itemTitle}" has been claimed and recovered by its owner.`,
      type: NOTIFICATION_TYPE.ITEM_RECOVERED,
    });
    const user = await userRepository.findById(finderId);
    if (user) emailService.sendItemRecovered(user.email, user.name, itemTitle);
  }

  async notifyAdminRemarks(studentId: string, itemTitle: string, remarks: string): Promise<void> {
    await this.create({
      recipient: studentId,
      title: 'Admin Remarks',
      message: `Admin remarks on your claim for "${itemTitle}": ${remarks}`,
      type: NOTIFICATION_TYPE.ADMIN_REMARKS,
    });
  }

  async notifyNewMatch(userId: string, lostTitle: string, foundTitle: string, score: number): Promise<void> {
    await this.create({
      recipient: userId,
      title: 'New AI Match',
      message: `A potential match (${Math.round(score * 100)}%) was found for "${lostTitle}": "${foundTitle}".`,
      type: NOTIFICATION_TYPE.ITEM_MATCH,
    });
    const user = await userRepository.findById(userId);
    if (user) emailService.sendMatchFound(user.email, user.name, lostTitle, score);
  }
}

export const notificationService = new NotificationService();
