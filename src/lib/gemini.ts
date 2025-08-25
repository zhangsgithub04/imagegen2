import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY && process.env.NODE_ENV !== 'production') {
  console.warn('GOOGLE_AI_API_KEY environment variable is not set');
}

const genAI = API_KEY ? new GoogleGenAI({
  apiKey: API_KEY,
}) : null;

export interface GenerateImageOptions {
  prompt: string;
  numberOfImages?: number;
}

export interface GeneratedImageResult {
  imageBytes: string;
  mimeType: string;
  metadata: {
    model: string;
    generationTime: number;
    imageSize: string;
    aspectRatio?: string;
    estimatedCost?: number;
    outputTokens?: number;
    cost?: number;
    quality?: string;
    style?: string;
  };
}

interface ApiError {
  status?: number;
  message?: string;
}

export async function generateImage({ 
  prompt, 
  numberOfImages = 1 
}: GenerateImageOptions): Promise<GeneratedImageResult[]> {
  try {
    if (!genAI) {
      throw new Error('Google AI API key is not configured');
    }

    // Try different model names in order of preference
    const modelNames = [
      'imagen-4.0-generate-001',
      'imagen-3.0-fast-generate-001',
      'imagen-3.0-generate-001', 
      'imagen-2.0-generate-001',
      'imagegeneration@006',
      'imagegeneration@005',
      'imagegeneration@002',
      'gemini-1.5-flash-latest', // Try Gemini models as fallback
      'gemini-1.5-pro-latest'
    ];

    let lastError: unknown = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        
        const response = await genAI.models.generateImages({
          model: modelName,
          prompt,
          config: {
            numberOfImages,
            // Use smallest possible dimensions to minimize API costs
            aspectRatio: '1:1', // Square format is typically most cost-effective
          },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
          throw new Error('No images were generated');
        }

        console.log(`Success with model: ${modelName}`);
        
        return response.generatedImages
          .filter(img => img.image?.imageBytes)
          .map(img => ({
            imageBytes: img.image!.imageBytes!,
            mimeType: 'image/png',
            metadata: {
              model: modelName,
              generationTime: 0,
              imageSize: '256x256', // Default for cost efficiency
              aspectRatio: '1:1',
              estimatedCost: 0.01, // Rough estimate
            },
          }));
          
      } catch (error: unknown) {
        lastError = error;
        const errorObj = error as ApiError;
        
        // If it's a model not found error, try the next model
        if (errorObj?.status === 404 || errorObj?.message?.includes('not found')) {
          console.log(`Model ${modelName} not found, trying next...`);
          continue;
        }
        
        // If it's a billing or permission error, don't try other models
        if (errorObj?.status === 400 && errorObj?.message?.includes('billed users')) {
          throw new Error('Imagen API requires billing to be enabled. Please set up billing in Google Cloud Console and ensure the Imagen API is enabled.');
        } else if (errorObj?.status === 403) {
          throw new Error('API key does not have permission to access Imagen API. Please check your API key permissions.');
        }
        
        // For other errors, continue trying
        console.log(`Error with model ${modelName}:`, error);
      }
    }

    // If we get here, all models failed
    const errorObj = lastError as ApiError;
    throw new Error(`All image models failed. Last error: ${errorObj?.message || 'Unknown error'}`);
    
  } catch (error: unknown) {
    console.error('Error generating image:', error);
    
    // Provide more specific error messages
    const errorObj = error as ApiError;
    if (errorObj?.status === 400 && errorObj?.message?.includes('billed users')) {
      throw new Error('Imagen API requires billing to be enabled. Please set up billing in Google Cloud Console and ensure the Imagen API is enabled.');
    } else if (errorObj?.status === 403) {
      throw new Error('API key does not have permission to access Imagen API. Please check your API key permissions.');
    } else if (errorObj?.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later or increase your quota.');
    }
    
    throw new Error(`Failed to generate image: ${errorObj?.message || 'Unknown error'}`);
  }
}

// Export alias for compatibility
export const generateImageWithGemini = generateImage;

// Note: The Google GenAI SDK might not support image generation yet
// We may need to use a different approach or API
