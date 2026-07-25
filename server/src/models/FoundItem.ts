import mongoose, { Document, Schema } from 'mongoose';
import { ITEM_STATUS } from '../constants';
import { IImageMetadata } from './LostItem';

export interface IFoundItem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  brand: string;
  color: string;
  images: string[];
  finder: mongoose.Types.ObjectId;
  college: mongoose.Types.ObjectId;
  location: string;
  dateFound: Date;
  status: string;
  embeddingId: string;
  embedding: number[];
  cloudinaryImageId: string;
  thumbnailUrl: string;
  optimizedImageUrl: string;
  imageMetadata: IImageMetadata | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const foundItemSchema = new Schema<IFoundItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    finder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Finder is required'],
    },
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    dateFound: {
      type: Date,
      required: [true, 'Date found is required'],
    },
    status: {
      type: String,
      enum: Object.values(ITEM_STATUS.FOUND),
      default: ITEM_STATUS.FOUND.OPEN,
    },
    embeddingId: {
      type: String,
      default: '',
    },
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
    cloudinaryImageId: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    optimizedImageUrl: {
      type: String,
      default: '',
    },
    imageMetadata: {
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      format: { type: String, default: '' },
      size: { type: Number, default: 0 },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

foundItemSchema.index({ finder: 1, college: 1 });
foundItemSchema.index({ college: 1, status: 1 });
foundItemSchema.index({ college: 1, status: 1, createdAt: -1 });
foundItemSchema.index({ title: 'text', description: 'text' });
foundItemSchema.index({ category: 1, dateFound: -1 });
foundItemSchema.index({ isDeleted: 1, college: 1, createdAt: -1 });
foundItemSchema.index({ brand: 1, color: 1, category: 1 });

export const FoundItem = mongoose.model<IFoundItem>('FoundItem', foundItemSchema);
