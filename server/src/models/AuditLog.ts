import mongoose, { Document, Schema } from 'mongoose';
import { AUDIT_ACTIONS } from '../constants';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId: mongoose.Types.ObjectId;
  college: mongoose.Types.ObjectId;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'PerformedBy is required'],
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: [true, 'Action is required'],
    },
    entity: {
      type: String,
      required: [true, 'Entity is required'],
      trim: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'EntityId is required'],
    },
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ college: 1, action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
