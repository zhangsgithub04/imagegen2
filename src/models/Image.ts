import mongoose from 'mongoose';

export interface IImage {
  _id?: string;
  prompt: string;
  imageData: string; // Base64 encoded image data
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for serialized data passed to client components
export interface SerializedImage {
  _id: string;
  prompt: string;
  imageData: string;
  mimeType: string;
  createdAt: string; // ISO string for serialization
  updatedAt: string; // ISO string for serialization
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
}, {
  timestamps: true,
});

// Create index for better query performance
ImageSchema.index({ createdAt: -1 });
ImageSchema.index({ prompt: 'text' });

export const Image = mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);
