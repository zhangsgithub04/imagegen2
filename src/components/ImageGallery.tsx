'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SerializedImage } from '@/models/Image';
import { deleteImage, getRecentImages, toggleImagePrivacy } from '@/app/actions';
import { Images, Trash2, Download, Calendar, Clock, Zap, ImageIcon, DollarSign, Cpu, User, Lock, Unlock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface ImageGalleryProps {
  refreshTrigger?: number;
}

export default function ImageGallery({ refreshTrigger }: ImageGalleryProps) {
  const [images, setImages] = useState<SerializedImage[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [togglingPrivacyIds, setTogglingPrivacyIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Handle hydration by only showing formatted dates after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const fetchedImages = await getRecentImages();
      setImages(fetchedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchImages();
    }
  }, [refreshTrigger]);

  const handleTogglePrivacy = async (imageId: string) => {
    if (!imageId) return;
    
    setTogglingPrivacyIds(prev => new Set(prev).add(imageId));
    
    try {
      const result = await toggleImagePrivacy(imageId);
      
      if (result.success) {
        setImages(prev => prev.map(img => 
          img._id === imageId 
            ? { ...img, isPrivate: result.isPrivate || false }
            : img
        ));
      } else {
        console.error('Failed to toggle image privacy:', result.error);
      }
    } catch (error) {
      console.error('Error toggling image privacy:', error);
    } finally {
      setTogglingPrivacyIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="w-5 h-5" />
            Loading Images...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Loading images...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        {formatDate(image.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{image.username}</span>
                      </div>
                      {image.isPrivate ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <Lock className="w-3 h-3" />
                          <span className="text-xs">Private</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <Unlock className="w-3 h-3" />
                          <span className="text-xs">Public</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Prompt:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {image.prompt}
                    </p>
                  </div>

                  {/* Metadata Section */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500">Provider:</span>
                      <span className="font-medium capitalize">{image.apiProvider}</span>
                    </div>

                    {image.model && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Model:</span>
                        <span className="font-medium">{image.model}</span>
                      </div>
                    )}

                    {image.imageSize && (
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium">{image.imageSize}</span>
                      </div>
                    )}

                    {image.generationTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium">{image.generationTime}ms</span>
                      </div>
                    )}

                    {image.outputTokens && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500">Tokens:</span>
                        <span className="font-medium">{image.outputTokens}</span>
                      </div>
                    )}

                    {image.cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500">Cost:</span>
                        <span className="font-medium">{formatCurrency(image.cost)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(image)}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Show privacy toggle only for the user's own images */}
                    {user && image.userId === user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePrivacy(image._id!)}
                        disabled={togglingPrivacyIds.has(image._id!)}
                        className="flex items-center gap-1"
                      >
                        {image.isPrivate ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {togglingPrivacyIds.has(image._id!) 
                          ? 'Updating...' 
                          : image.isPrivate ? 'Make Public' : 'Make Private'
                        }
                      </Button>
                    )}
                    
                    {/* Show delete button only for the user's own images */}
                    {user && image.userId === user.id && (
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
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
