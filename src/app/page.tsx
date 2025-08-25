'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ImageGenerator from '@/components/ImageGenerator';
import ImageGallery from '@/components/ImageGallery';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleImageGenerated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Image Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate amazing images with OpenAI&apos;s DALL-E AI
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Welcome back, {user.username}! 
            <button 
              onClick={() => router.push('/auth')}
              className="ml-2 text-blue-600 hover:text-blue-700 underline"
            >
              Sign Out
            </button>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Generator */}
          <div className="lg:sticky lg:top-8 h-fit">
            <ImageGenerator onImageGenerated={handleImageGenerated} />
          </div>

          {/* Image Gallery */}
          <div>
            <ImageGallery refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </main>
  );
}
