import mongoose, { Document, Schema } from 'mongoose';
import { CLAIM_STATUS } from '../constants';

export interface IVerificationAnswer {
  question: string;
  answer: string;
}

export interface IClaim extends Document {
  student: mongoose.Types.ObjectId;
  lostItem: mongoose.Types.ObjectId;
  foundItem: mongoose.Types.ObjectId;
  verificationAnswers: IVerificationAnswer[];
  status: string;
  adminRemarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const verificationAnswerSchema = new Schema<IVerificationAnswer>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const claimSchema = new Schema<IClaim>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    lostItem: {
      type: Schema.Types.ObjectId,
      ref: 'LostItem',
      required: [true, 'Lost item is required'],
    },
    foundItem: {
      type: Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: [true, 'Found item is required'],
    },
    verificationAnswers: {
      type: [verificationAnswerSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(CLAIM_STATUS),
      default: CLAIM_STATUS.PENDING,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ student: 1 });
claimSchema.index({ lostItem: 1, foundItem: 1 });
claimSchema.index({ status: 1 });

export const Claim = mongoose.model<IClaim>('Claim', claimSchema);
