import mongoose from 'mongoose';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { AUDIT_ACTIONS, PAGINATION } from '../constants';
import { IAuditLog } from '../models';
import { logger } from '../utils/logger';

export interface AuditLogInput {
  performedBy: string;
  action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
  entity: string;
  entityId: string;
  college: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

export class AuditLogService {
  async log(input: AuditLogInput): Promise<IAuditLog> {
    const entry = await auditLogRepository.create({
      performedBy: new mongoose.Types.ObjectId(input.performedBy),
      action: input.action,
      entity: input.entity,
      entityId: new mongoose.Types.ObjectId(input.entityId),
      college: new mongoose.Types.ObjectId(input.college),
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      metadata: input.metadata ?? {},
    });

    logger.info(
      `Audit: [${input.action}] ${input.entity}/${input.entityId} by ${input.performedBy}`
    );

    return entry;
  }

  async getEntityHistory(
    entity: string,
    entityId: string,
    page?: number,
    limit?: number
  ) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { logs, total } = await auditLogRepository.findByEntity(entity, entityId, p, l);

    return {
      data: logs,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async getCollegeAuditLogs(
    collegeId: string,
    page?: number,
    limit?: number
  ) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { logs, total } = await auditLogRepository.findByCollege(collegeId, p, l);

    return {
      data: logs,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }
}

export const auditLogService = new AuditLogService();
