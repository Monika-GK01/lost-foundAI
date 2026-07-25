import mongoose, { Document, Schema } from 'mongoose';
import { COLLEGE_STATUS } from '../constants';

export interface ICollege extends Document {
  name: string;
  collegeCode: string;
  email: string;
  phone: string;
  logo: string;
  address: string;
  website: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      maxlength: [200, 'College name cannot exceed 200 characters'],
    },
    collegeCode: {
      type: String,
      required: [true, 'College code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'College code cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    website: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(COLLEGE_STATUS),
      default: COLLEGE_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

collegeSchema.index({ collegeCode: 1 });
collegeSchema.index({ name: 'text' });

export const College = mongoose.model<ICollege>('College', collegeSchema);
