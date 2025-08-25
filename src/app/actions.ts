'use server';

import { generateImageWithGemini } from '@/lib/gemini';
import { generateImageWithOpenAI } from '@/lib/openai';
import connectToMongoDB from '@/lib/mongodb';
import { Image, SerializedImage } from '@/models/Image';
import { validateAndSanitizePrompt } from '@/lib/promptSanitizer';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export interface GenerateImageResponse {
  success: boolean;
  images?: SerializedImage[];
  error?: string;
}

export async function generateAndSaveImage(prompt: string, useOpenAI: boolean = false, isPrivate: boolean = false): Promise<GenerateImageResponse> {
  try {
    if (!prompt || prompt.trim().length === 0) {
      return { success: false, error: 'Prompt is required' };
    }

    // Get user token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token?.value) {
      return { success: false, error: 'Authentication required. Please sign in to generate images.' };
    }

    // Verify token and get user info
    const userPayload = verifyToken(token.value);
    if (!userPayload) {
      return { success: false, error: 'Invalid authentication. Please sign in again.' };
    }

    // Sanitize and validate prompt
    const sanitizationResult = validateAndSanitizePrompt(prompt.trim());
    if (!sanitizationResult.isValid) {
      return { 
        success: false, 
        error: `Prompt contains inappropriate content: ${sanitizationResult.blockedTerms.join(', ')}. Please revise your prompt.` 
      };
    }

    const sanitizedPrompt = sanitizationResult.sanitizedPrompt || prompt.trim();

    // Connect to MongoDB
    await connectToMongoDB();

    // Generate image using either Gemini or OpenAI
    const generatedImages = useOpenAI 
      ? await generateImageWithOpenAI({ 
          prompt: sanitizedPrompt,
          numberOfImages: 1
        })
      : await generateImageWithGemini({ 
          prompt: sanitizedPrompt,
          numberOfImages: 1
        });

    if (!generatedImages || generatedImages.length === 0) {
      return { success: false, error: 'No images were generated' };
    }

    // Save images to MongoDB
    const savedImages: SerializedImage[] = [];
    
    for (const genImage of generatedImages) {
      const newImage = new Image({
        prompt: sanitizedPrompt,
        imageData: genImage.imageBytes,
        mimeType: genImage.mimeType,
        userId: userPayload.userId,
        username: userPayload.username,
        isPrivate: isPrivate,
        // Add required metadata fields
        apiProvider: useOpenAI ? 'openai' : 'gemini',
        model: genImage.metadata?.model || (useOpenAI ? 'dall-e-3' : 'gemini-pro-vision'),
        imageSize: genImage.metadata?.imageSize || (useOpenAI ? '1024x1024' : '256x256'),
        generationTime: genImage.metadata?.generationTime || 0,
        outputTokens: genImage.metadata?.outputTokens,
        cost: genImage.metadata?.estimatedCost,
        aspectRatio: genImage.metadata?.aspectRatio,
        quality: genImage.metadata?.quality,
        style: genImage.metadata?.style,
      });

      const savedImage = await newImage.save();
      // Properly serialize the MongoDB object
      const serializedImage: SerializedImage = {
        _id: savedImage._id.toString(),
        prompt: savedImage.prompt,
        imageData: savedImage.imageData,
        mimeType: savedImage.mimeType,
        userId: savedImage.userId,
        username: savedImage.username,
        isPrivate: savedImage.isPrivate,
        createdAt: savedImage.createdAt.toISOString(),
        updatedAt: savedImage.updatedAt.toISOString(),
        apiProvider: savedImage.apiProvider,
        model: savedImage.model,
        imageSize: savedImage.imageSize,
        generationTime: savedImage.generationTime,
        outputTokens: savedImage.outputTokens,
        cost: savedImage.cost,
        aspectRatio: savedImage.aspectRatio,
        quality: savedImage.quality,
        style: savedImage.style,
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
    
    // Only get public images for the gallery
    const images = await Image.find({ isPrivate: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Properly serialize each image object
    return images.map((img: Record<string, unknown>) => ({
      _id: (img._id as { toString(): string })?.toString() || '',
      prompt: (img.prompt as string) || '',
      imageData: (img.imageData as string) || '',
      mimeType: (img.mimeType as string) || 'image/png',
      userId: (img.userId as string) || '',
      username: (img.username as string) || 'Unknown User',
      isPrivate: (img.isPrivate as boolean) || false,
      createdAt: (img.createdAt as Date)?.toISOString() || new Date().toISOString(),
      updatedAt: (img.updatedAt as Date)?.toISOString() || new Date().toISOString(),
      apiProvider: ((img.apiProvider as string) === 'openai' ? 'openai' : 'gemini') as 'gemini' | 'openai',
      model: (img.model as string) || 'gemini-pro-vision',
      imageSize: (img.imageSize as string) || '1024x1024',
      generationTime: (img.generationTime as number) || 0,
      outputTokens: img.outputTokens as number | undefined,
      cost: img.cost as number | undefined,
      aspectRatio: img.aspectRatio as string | undefined,
      quality: img.quality as string | undefined,
      style: img.style as string | undefined,
    }));
  } catch (error) {
    console.error('Error fetching recent images:', error);
    return [];
  }
}

export async function getUserImages(limit: number = 20): Promise<SerializedImage[]> {
  try {
    // Get user token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token?.value) {
      return [];
    }

    // Verify token and get user info
    const userPayload = verifyToken(token.value);
    if (!userPayload) {
      return [];
    }

    await connectToMongoDB();
    
    // Get all images for this user (both private and public)
    const images = await Image.find({ userId: userPayload.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Properly serialize each image object
    return images.map((img: Record<string, unknown>) => ({
      _id: (img._id as { toString(): string })?.toString() || '',
      prompt: (img.prompt as string) || '',
      imageData: (img.imageData as string) || '',
      mimeType: (img.mimeType as string) || 'image/png',
      userId: (img.userId as string) || '',
      username: (img.username as string) || 'Unknown User',
      isPrivate: (img.isPrivate as boolean) || false,
      createdAt: (img.createdAt as Date)?.toISOString() || new Date().toISOString(),
      updatedAt: (img.updatedAt as Date)?.toISOString() || new Date().toISOString(),
      apiProvider: ((img.apiProvider as string) === 'openai' ? 'openai' : 'gemini') as 'gemini' | 'openai',
      model: (img.model as string) || 'gemini-pro-vision',
      imageSize: (img.imageSize as string) || '1024x1024',
      generationTime: (img.generationTime as number) || 0,
      outputTokens: img.outputTokens as number | undefined,
      cost: img.cost as number | undefined,
      aspectRatio: img.aspectRatio as string | undefined,
      quality: img.quality as string | undefined,
      style: img.style as string | undefined,
    }));
  } catch (error) {
    console.error('Error fetching user images:', error);
    return [];
  }
}

export async function deleteImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token?.value) {
      return { success: false, error: 'Authentication required.' };
    }

    // Verify token and get user info
    const userPayload = verifyToken(token.value);
    if (!userPayload) {
      return { success: false, error: 'Invalid authentication.' };
    }

    await connectToMongoDB();
    
    // Check if the image exists and belongs to the user
    const image = await Image.findById(imageId);
    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    if (image.userId !== userPayload.userId) {
      return { success: false, error: 'You can only delete your own images' };
    }
    
    await Image.findByIdAndDelete(imageId);

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

export async function toggleImagePrivacy(imageId: string): Promise<{ success: boolean; error?: string; isPrivate?: boolean }> {
  try {
    // Get user token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token?.value) {
      return { success: false, error: 'Authentication required.' };
    }

    // Verify token and get user info
    const userPayload = verifyToken(token.value);
    if (!userPayload) {
      return { success: false, error: 'Invalid authentication.' };
    }

    await connectToMongoDB();
    
    // Check if the image exists and belongs to the user
    const image = await Image.findById(imageId);
    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    if (image.userId !== userPayload.userId) {
      return { success: false, error: 'You can only modify your own images' };
    }
    
    // Toggle privacy
    const updatedImage = await Image.findByIdAndUpdate(
      imageId, 
      { isPrivate: !image.isPrivate },
      { new: true }
    );

    revalidatePath('/');
    return { success: true, isPrivate: updatedImage?.isPrivate };
  } catch (error) {
    console.error('Error toggling image privacy:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update image privacy' 
    };
  }
}
