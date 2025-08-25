import mongoose from 'mongoose';

export interface IImage {
  _id?: string;
  prompt: string;
  imageData: string; // Base64 encoded image data
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
  // User and privacy fields
  userId: string; // Reference to User
  username: string; // Denormalized for performance
  isPrivate: boolean; // true = private, false = public (default)
  // New metadata fields
  apiProvider: 'gemini' | 'openai';
  model: string;
  imageSize: string; // e.g., "1024x1024"
  generationTime: number; // in milliseconds
  outputTokens?: number; // for APIs that provide this
  cost?: number; // estimated cost in USD
  aspectRatio?: string;
  quality?: string;
  style?: string;
}

// Interface for serialized data passed to client components
export interface SerializedImage {
  _id: string;
  prompt: string;
  imageData: string;
  mimeType: string;
  createdAt: string; // ISO string for serialization
  updatedAt: string; // ISO string for serialization
  // User and privacy fields
  userId: string;
  username: string;
  isPrivate: boolean;
  // New metadata fields
  apiProvider: 'gemini' | 'openai';
  model: string;
  imageSize: string;
  generationTime: number;
  outputTokens?: number;
  cost?: number;
  aspectRatio?: string;
  quality?: string;
  style?: string;
}

const ImageSchema = new mongoose.Schema<IImage>({
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  imageData: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
    default: 'image/png',
  },
  // User and privacy fields
  userId: {
    type: String,
    required: true,
    index: true, // For efficient queries
  },
  username: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    required: true,
    default: false, // Public by default
    index: true, // For efficient filtering
  },
  apiProvider: {
    type: String,
    required: true,
    enum: ['gemini', 'openai'],
  },
  model: {
    type: String,
    required: true,
  },
  imageSize: {
    type: String,
    required: true,
  },
  generationTime: {
    type: Number,
    required: true,
  },
  outputTokens: {
    type: Number,
  },
  cost: {
    type: Number,
  },
  aspectRatio: {
    type: String,
  },
  quality: {
    type: String,
  },
  style: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create index for better query performance
ImageSchema.index({ createdAt: -1 });
ImageSchema.index({ prompt: 'text' });

export const Image = mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);
