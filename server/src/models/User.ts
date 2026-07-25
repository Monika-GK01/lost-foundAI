import mongoose, { Document, Schema } from 'mongoose';
import { ROLES, USER_STATUS } from '../constants';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  college: mongoose.Types.ObjectId;
  profileImage: string;
  department: string;
  year: number;
  rollNumber: string;
  phone: string;
  trustScore: number;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: Number,
      min: [1, 'Year must be at least 1'],
      max: [6, 'Year cannot exceed 6'],
    },
    rollNumber: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    trustScore: {
      type: Number,
      default: 50,
      min: [0, 'Trust score cannot be negative'],
      max: [100, 'Trust score cannot exceed 100'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ college: 1, role: 1 });
userSchema.index({ name: 'text', email: 'text' });

export const User = mongoose.model<IUser>('User', userSchema);
