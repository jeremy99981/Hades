'use client';

import { useEffect, useState, useRef } from 'react';
import { clientApi } from '@/app/lib/tmdb';
import { type Media } from '@/app/lib/schemas';
import MediaCard from './MediaCard';

interface RecommendationsProps {
  mediaType: 'movie' | 'tv';
  mediaId: string;
}

export default function Recommendations({ mediaType, mediaId }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth - 100;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await clientApi.getRecommendations(mediaType, mediaId);
        setRecommendations(response.results.slice(0, 12));
      } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        setError('Impossible de charger les recommandations');
      } finally {
        setLoading(false);
      }
    };

    if (mediaType && mediaId) {
      fetchRecommendations();
    }
  }, [mediaType, mediaId]);

  if (error) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-8 px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Recommandations</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] bg-gray-800 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Recommandations</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:flex md:gap-4 md:overflow-x-auto md:scroll-smooth md:pb-4 scrollbar-hide"
      >
        {recommendations.map((media) => (
          <MediaCard 
            key={media.id} 
            item={media} 
            forcedMediaType={mediaType}
          />
        ))}
      </div>
    </div>
  );
}
