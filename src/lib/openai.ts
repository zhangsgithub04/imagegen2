import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface GenerateImageOptions {
  prompt: string;
  numberOfImages?: number;
}

export interface GeneratedImageResult {
  imageBytes: string;
  mimeType: string;
}

export async function generateImageWithOpenAI({ 
  prompt, 
  numberOfImages = 1 
}: GenerateImageOptions): Promise<GeneratedImageResult[]> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: numberOfImages,
      size: "1024x1024", // Smallest available size for DALL-E 3
      response_format: "b64_json",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No images were generated');
    }

    return response.data
      .filter(img => img.b64_json)
      .map(img => ({
        imageBytes: img.b64_json!,
        mimeType: 'image/png',
      }));
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
