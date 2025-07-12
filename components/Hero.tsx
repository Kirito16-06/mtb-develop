import { useState } from 'react';
import Image from 'next/image';
import Skeleton from './Skeleton';

interface HeroProps {
  title: string;
  description: string;
  imageUrl: string;
  onGetStarted: () => void;
}

const Hero = ({ title, description, imageUrl, onGetStarted }: HeroProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
          <div className="w-full md:w-1/2 space-y-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {title}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {description}
            </p>
            <button 
              onClick={onGetStarted}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg 
                hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>
          
          <div className="w-full md:w-1/2 relative aspect-video">
            {imageLoading && (
              <Skeleton className="absolute inset-0 rounded-lg" />
            )}
            <Image
              src={imageUrl}
              alt="Hero"
              fill
              className="rounded-lg shadow-lg object-cover"
              onLoadingComplete={() => setImageLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 