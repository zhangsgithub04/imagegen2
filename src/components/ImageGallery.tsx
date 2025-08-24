'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SerializedImage } from '@/models/Image';
import { deleteImage } from '@/app/actions';
import { Images, Trash2, Download, Calendar } from 'lucide-react';
import Image from 'next/image';

interface ImageGalleryProps {
  initialImages: SerializedImage[];
}

export default function ImageGallery({ initialImages }: ImageGalleryProps) {
  const [images, setImages] = useState(initialImages);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Handle hydration by only showing formatted dates after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (imageId: string) => {
    if (!imageId) return;
    
    setDeletingIds(prev => new Set(prev).add(imageId));
    
    try {
      const result = await deleteImage(imageId);
      
      if (result.success) {
        setImages(prev => prev.filter(img => img._id !== imageId));
      } else {
        console.error('Failed to delete image:', result.error);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const handleDownload = (image: SerializedImage) => {
    try {
      const link = document.createElement('a');
      link.href = `data:${image.mimeType};base64,${image.imageData}`;
      link.download = `ai-image-${image._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted) {
      // Return a simple format during SSR to avoid hydration mismatch
      return new Date(dateString).toISOString().split('T')[0];
    }
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="w-5 h-5" />
          Generated Images ({images.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8">
            <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              No images generated yet. Create your first image above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {images.map((image) => (
              <div
                key={image._id}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Image Display */}
                <div className="relative aspect-square w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={`data:${image.mimeType};base64,${image.imageData}`}
                    alt={image.prompt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Image Info */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-500">
                      {formatDate(image.createdAt)}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Prompt:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {image.prompt}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(image)}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image._id!)}
                    disabled={deletingIds.has(image._id!)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {deletingIds.has(image._id!) ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
