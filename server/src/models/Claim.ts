import mongoose, { Document, Schema } from 'mongoose';
import { CLAIM_STATUS } from '../constants';

export interface IVerificationAnswer {
  question: string;
  answer: string;
}

export interface IPickupDetails {
  office: string;
  building: string;
  room: string;
  contactPerson: string;
  pickupTime: string;
  verificationCode: string;
}

export interface IClaim extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  lostItem: mongoose.Types.ObjectId;
  foundItem: mongoose.Types.ObjectId;
  college: mongoose.Types.ObjectId;
  verificationAnswers: IVerificationAnswer[];
  proofImages: string[];
  status: string;
  adminRemarks: string;
  reviewedBy: mongoose.Types.ObjectId | null;
  reviewedAt: Date | null;
  recoveryTimestamp: Date | null;
  aiMatchScore: number;
  pickupDetails: IPickupDetails | null;
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

const pickupDetailsSchema = new Schema<IPickupDetails>(
  {
    office: { type: String, default: 'Student Affairs Office' },
    building: { type: String, default: 'Block A' },
    room: { type: String, default: '105' },
    contactPerson: { type: String, default: '' },
    pickupTime: { type: String, default: '' },
    verificationCode: { type: String, default: '' },
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
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
    verificationAnswers: {
      type: [verificationAnswerSchema],
      default: [],
    },
    proofImages: {
      type: [String],
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
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    recoveryTimestamp: {
      type: Date,
      default: null,
    },
    aiMatchScore: {
      type: Number,
      default: 0,
    },
    pickupDetails: {
      type: pickupDetailsSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ student: 1 });
claimSchema.index({ lostItem: 1, foundItem: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ college: 1, status: 1 });
claimSchema.index({ college: 1, createdAt: -1 });

export const Claim = mongoose.model<IClaim>('Claim', claimSchema);
