'use server';

import { generateImage } from '@/lib/gemini';
import { generateImageWithOpenAI } from '@/lib/openai';
import connectToMongoDB from '@/lib/mongodb';
import { Image, SerializedImage } from '@/models/Image';
import { revalidatePath } from 'next/cache';

export interface GenerateImageResponse {
  success: boolean;
  images?: SerializedImage[];
  error?: string;
}

export async function generateAndSaveImage(prompt: string, useOpenAI: boolean = false): Promise<GenerateImageResponse> {
  try {
    if (!prompt || prompt.trim().length === 0) {
      return { success: false, error: 'Prompt is required' };
    }

    // Connect to MongoDB
    await connectToMongoDB();

    // Generate image using either Gemini or OpenAI
    const generatedImages = useOpenAI 
      ? await generateImageWithOpenAI({ 
          prompt: prompt.trim(),
          numberOfImages: 1
        })
      : await generateImage({ 
          prompt: prompt.trim(),
          numberOfImages: 1
        });

    if (!generatedImages || generatedImages.length === 0) {
      return { success: false, error: 'No images were generated' };
    }

    // Save images to MongoDB
    const savedImages: SerializedImage[] = [];
    
    for (const genImage of generatedImages) {
      const newImage = new Image({
        prompt: prompt.trim(),
        imageData: genImage.imageBytes,
        mimeType: genImage.mimeType,
      });

      const savedImage = await newImage.save();
      // Properly serialize the MongoDB object
      const serializedImage: SerializedImage = {
        _id: savedImage._id.toString(),
        prompt: savedImage.prompt,
        imageData: savedImage.imageData,
        mimeType: savedImage.mimeType,
        createdAt: savedImage.createdAt.toISOString(),
        updatedAt: savedImage.updatedAt.toISOString(),
      };
      savedImages.push(serializedImage);
    }

    // Revalidate the page to show new images
    revalidatePath('/');

    return { 
      success: true, 
      images: savedImages 
    };
  } catch (error) {
    console.error('Error in generateAndSaveImage:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    };
  }
}

export async function getRecentImages(limit: number = 10): Promise<SerializedImage[]> {
  try {
    await connectToMongoDB();
    
    const images = await Image.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Properly serialize each image object
    return images.map(img => ({
      _id: img._id?.toString() || '',
      prompt: img.prompt || '',
      imageData: img.imageData || '',
      mimeType: img.mimeType || 'image/png',
      createdAt: new Date(img.createdAt).toISOString(),
      updatedAt: new Date(img.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching recent images:', error);
    return [];
  }
}

export async function deleteImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToMongoDB();
    
    const result = await Image.findByIdAndDelete(imageId);
    
    if (!result) {
      return { success: false, error: 'Image not found' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete image' 
    };
  }
}
