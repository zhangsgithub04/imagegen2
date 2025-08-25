import mongoose from 'mongoose';

export interface IUser {
  _id?: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedUser {
  _id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
}, {
  timestamps: true,
});

// Indexes are automatically created by unique: true, so no need for explicit indexes

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
