'use client';

import { getProviderContent, getImageUrl } from '@/app/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, ChevronLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import MediaRow from '@/app/components/MediaRow';

interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  media_type: string;
  vote_average: number;
  first_air_date?: string;
  release_date?: string;
  overview: string;
}

const getProviderName = (providerId: string) => {
  switch (providerId) {
    case '8':
      return 'Netflix';
    case '9':
      return 'Prime Video';
    case '337':
      return 'Disney+';
    case '350':
      return 'Apple TV+';
    case '15':
      return 'Hulu';
    case '531':
      return 'Paramount+';
    default:
      return 'Streaming Service';
  }
};

function ProviderContent({ params }: { params: { providerId: string } }) {
  const [content, setContent] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState('');
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const data = await getProviderContent(Number(params.providerId));
        const movies = data.filter((item: Media) => item.media_type === 'movie');
        const tvShows = data.filter((item: Media) => item.media_type === 'tv');
        setContent([...movies, ...tvShows]);
        setProviderName(getProviderName(params.providerId));
        
        // Sélectionner le premier élément avec une image de fond pour le héro
        const itemWithBackdrop = data.find(item => item.backdrop_path);
        if (itemWithBackdrop) {
          setSelectedItem(itemWithBackdrop);
        }
      } catch (err) {
        setError('Failed to load content');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [params.providerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] p-24">
        <h1 className="text-4xl font-medium text-white mb-3">{providerName}</h1>
        <p className="text-xl text-white/60">{error}</p>
      </div>
    );
  }

  const movies = content.filter((item) => item.media_type === 'movie');
  const tvShows = content.filter((item) => item.media_type === 'tv');

  const MediaCard = ({ item }: { item: Media }) => (
    <div
      className="relative p-[2px] rounded-[10px] overflow-hidden group/item flex-shrink-0"
      style={{ width: '240px' }}
    >
      <Link
        href={`/${item.media_type}/${item.id}`}
        className="relative overflow-hidden rounded-[10px] transition-transform duration-300 ease-out group-hover/item:scale-[1.02] aspect-[2/3] block"
      >
        <Image
          src={getImageUrl(item.poster_path)}
          alt={item.title || item.name || ''}
          fill
          className="object-cover"
          sizes="240px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 transition-opacity duration-300 group-hover/item:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center space-x-2 text-[13px] text-white/90">
              <span className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                {item.vote_average?.toFixed(1)}
              </span>
              <span>•</span>
              <span>{new Date(item.release_date || item.first_air_date || '').getFullYear()}</span>
            </div>
            <h3 className="font-semibold text-lg leading-tight text-white mt-2">
              {item.title || item.name}
            </h3>
            <div className="flex items-center gap-2 mt-3">
              <Link
                href={`/${item.media_type}/${item.id}`}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded text-black text-sm font-medium transition-colors duration-200"
              >
                <PlayIcon className="w-3.5 h-3.5" />
                Lecture
              </Link>
              <button 
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800/75 hover:bg-gray-800/90 rounded text-white text-sm font-medium transition-colors duration-200 whitespace-nowrap"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Ma Liste
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      {/* Back Button */}
      <Link 
        href="/"
        className="fixed top-8 left-8 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-200"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </Link>

      {/* Hero Section */}
      {selectedItem && (
        <div className="relative h-screen w-full">
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(selectedItem.backdrop_path, 'original')}
              alt={selectedItem.title || selectedItem.name || ''}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
            <h1 className="text-[80px] font-bold text-white leading-none tracking-tight drop-shadow-lg">
              {providerName}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-white/90">
              <span>{content.length} titres disponibles</span>
            </div>

            <div className="flex items-center gap-4 mb-36">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-white/90 text-black font-medium rounded-lg hover:bg-white transition-colors duration-200">
                <PlayIcon className="w-5 h-5" />
                Explorer le catalogue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 -mt-32 pt-36 space-y-12 pb-12">
        <MediaRow title="Films" itemWidth={240}>
          {movies.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </MediaRow>

        <MediaRow title="Séries" itemWidth={240}>
          {tvShows.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </MediaRow>
      </div>
    </main>
  );
}

export default ProviderContent;
