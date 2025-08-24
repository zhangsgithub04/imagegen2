import ImageGenerator from '@/components/ImageGenerator';
import ImageGallery from '@/components/ImageGallery';
import { getRecentImages } from './actions';

export default async function Home() {
  const recentImages = await getRecentImages(20);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Image Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate amazing images with Google&apos;s Gemini AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Generator */}
          <div className="lg:sticky lg:top-8 h-fit">
            <ImageGenerator />
          </div>

          {/* Image Gallery */}
          <div>
            <ImageGallery initialImages={recentImages} />
          </div>
        </div>
      </div>
    </main>
  );
}
