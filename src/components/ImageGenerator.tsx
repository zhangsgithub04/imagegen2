'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateAndSaveImage, type GenerateImageResponse } from '@/app/actions';
import { Loader2, ImageIcon, AlertCircle } from 'lucide-react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GenerateImageResponse | null>(null);
  const [useOpenAI, setUseOpenAI] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setResponse({ success: false, error: 'Please enter a prompt' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const result = await generateAndSaveImage(prompt, useOpenAI);
      setResponse(result);
      
      if (result.success) {
        setPrompt(''); // Clear the prompt on success
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setResponse({ 
        success: false, 
        error: 'An unexpected error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Generate New Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={loading}
            />
          </div>

          {/* API Selection */}
          <div className="space-y-2">
            <Label>Image Generation API</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="api"
                  checked={!useOpenAI}
                  onChange={() => setUseOpenAI(false)}
                  disabled={loading}
                />
                <span className="text-sm">Google Gemini (requires billing)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="api"
                  checked={useOpenAI}
                  onChange={() => setUseOpenAI(true)}
                  disabled={loading}
                />
                <span className="text-sm">OpenAI DALL-E 3</span>
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with {useOpenAI ? 'OpenAI' : 'Gemini'}...
              </>
            ) : (
              `Generate Image with ${useOpenAI ? 'OpenAI' : 'Gemini'}`
            )}
          </Button>
        </form>

        {/* Response Messages */}
        {response && (
          <div className="mt-4">
            {response.success ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">
                  ✅ Image generated successfully! Check the gallery below.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-800 text-sm">
                    {response.error}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Information */}
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-xs">
              💡 <strong>Gemini:</strong> Requires Google Cloud billing setup. 
              Cost-optimized for smallest image sizes.
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <p className="text-purple-800 text-xs">
              🎨 <strong>OpenAI DALL-E 3:</strong> Easier setup, $0.04 per image (1024x1024). 
              Add OPENAI_API_KEY to .env.local
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
