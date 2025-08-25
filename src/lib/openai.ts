import OpenAI from 'openai';

export interface GeneratedImageResult {
  imageBytes: string;
  mimeType: string;
  metadata: {
    model: string;
    generationTime: number;
    imageSize: string;
    quality?: string;
    estimatedCost?: number;
    outputTokens?: number;
    cost?: number;
    aspectRatio?: string;
    style?: string;
  };
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface GenerateImageOptions {
  prompt: string;
  numberOfImages?: number;
}

export async function generateImageWithOpenAI({ 
  prompt, 
  numberOfImages = 1 
}: GenerateImageOptions): Promise<GeneratedImageResult[]> {
  const startTime = Date.now();
  
  try {
    if (!openai) {
      throw new Error('OpenAI API key is not configured');
    }

    // Try DALL-E 2 first for smaller/cheaper images, then fall back to DALL-E 3
    const models = [
      {
        model: "dall-e-2" as const,
        size: "256x256" as const, // Smallest and cheapest size
        quality: undefined, // DALL-E 2 doesn't have quality parameter
        cost: 0.016, // $0.016 per image for DALL-E 2 256x256
      },
      {
        model: "dall-e-3" as const,
        size: "1024x1024" as const, // DALL-E 3 smallest size
        quality: "standard" as const,
        cost: 0.04, // $0.04 per image for DALL-E 3 standard quality
      }
    ];

    let lastError: unknown = null;

    for (const modelConfig of models) {
      try {
        const requestParams: {
          model: "dall-e-2" | "dall-e-3";
          prompt: string;
          n: number;
          size: "256x256" | "512x512" | "1024x1024";
          response_format: "b64_json";
          quality?: "standard" | "hd";
        } = {
          model: modelConfig.model,
          prompt,
          n: numberOfImages,
          size: modelConfig.size,
          response_format: "b64_json" as const,
        };

        // Only add quality for DALL-E 3
        if (modelConfig.quality) {
          requestParams.quality = modelConfig.quality;
        }

        const response = await openai.images.generate(requestParams);

        if (!response.data || response.data.length === 0) {
          throw new Error('No images were generated');
        }

        const generationTime = Date.now() - startTime;

        return response.data
          .filter(img => img.b64_json)
          .map(img => ({
            imageBytes: img.b64_json!,
            mimeType: 'image/png',
            metadata: {
              model: modelConfig.model,
              generationTime,
              imageSize: modelConfig.size,
              quality: modelConfig.quality || 'standard',
              estimatedCost: modelConfig.cost,
              aspectRatio: '1:1',
            }
          }));

      } catch (error: unknown) {
        lastError = error;
        console.log(`Error with ${modelConfig.model}:`, error);
        
        const errorObj = error as { status?: number; message?: string };
        
        // If it's a model not found or access error, try the next model
        if (errorObj?.status === 404 || errorObj?.status === 403) {
          continue;
        }
        
        // For other errors, continue trying other models
      }
    }

    // If we get here, all models failed
    throw lastError;
    
  } catch (error: unknown) {
    console.error('Error generating image with OpenAI:', error);
    
    interface OpenAIError {
      status?: number;
      message?: string;
    }
    
    const errorObj = error as OpenAIError;
    if (errorObj?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key.');
    } else if (errorObj?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (errorObj?.status === 400) {
      throw new Error('Invalid request. Please check your prompt and try again.');
    }
    
    throw new Error(`Failed to generate image: ${errorObj?.message || 'Unknown error'}`);
  }
}
