import { Notification, INotification } from '../models';
import { PAGINATION } from '../constants';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return Notification.create(data);
  }

  async findByRecipient(
    recipientId: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: recipientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Notification.countDocuments({ recipient: recipientId }).exec(),
      Notification.countDocuments({ recipient: recipientId, isRead: false }).exec(),
    ]);

    return { notifications, total, unreadCount };
  }

  async countUnread(recipientId: string): Promise<number> {
    return Notification.countDocuments({ recipient: recipientId, isRead: false }).exec();
  }

  async markAsRead(id: string, recipientId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: id, recipient: recipientId },
      { isRead: true },
      { new: true }
    ).exec();
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true }
    ).exec();
    return result.modifiedCount;
  }
}

export const notificationRepository = new NotificationRepository();
