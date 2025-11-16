import { Schema, model, type Document, type Types } from 'mongoose';
import type { UserRole } from '../types/users';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
    },
    company: {
      type: String,
    },
    role: {
      type: String,
      enum: ['broker', 'buyer', 'admin'],
      default: 'buyer',
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });

export const User = model<UserDocument>('User', userSchema);
