import { AuditLog, IAuditLog } from '../models';
import { PAGINATION } from '../constants';

export class AuditLogRepository {
  async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    return AuditLog.create(data);
  }

  async findByEntity(
    entity: string,
    entityId: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ entity, entityId })
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      AuditLog.countDocuments({ entity, entityId }).exec(),
    ]);

    return { logs, total };
  }

  async findByCollege(
    collegeId: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ college: collegeId })
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      AuditLog.countDocuments({ college: collegeId }).exec(),
    ]);

    return { logs, total };
  }
}

export const auditLogRepository = new AuditLogRepository();
