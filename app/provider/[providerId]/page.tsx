'use client';

import { getImageUrl, clientApi } from '@/app/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import MediaRow from '@/app/components/MediaRow';
import BackButton from '@/app/components/BackButton';
import HeartIcon from '@/app/components/icons/HeartIcon';
import HeartIconSolid from '@/app/components/icons/HeartIconSolid';
import OverseerrStatus from '@/app/components/OverseerrStatus';

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
        const data = await clientApi.getProviderContent(Number(params.providerId));
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

  const MediaCard = ({ item }: { item: Media }) => {
    const [isLiked, setIsLiked] = useState(false);
    
    return (
      <div
        className="relative p-[2px] rounded-[10px] overflow-hidden group/item flex-shrink-0"
        style={{ width: '250px' }}
      >
        <OverseerrStatus mediaType={item.media_type} mediaId={item.id} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative rounded-[10px] overflow-hidden">
          <Link href={`/${item.media_type}/${item.id}`}>
            <Image
              src={getImageUrl(item.poster_path)}
              alt={item.title || item.name || ''}
              width={250}
              height={375}
              sizes="250px"
              quality={90}
              priority
              className="object-cover aspect-[2/3]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover/item:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center space-x-2 text-[13px] text-white/90">
                  <span className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    {item.vote_average?.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(
                      item.release_date || item.first_air_date || ''
                    ).getFullYear()}
                  </span>
                </div>

                <h3 className="font-semibold text-xl leading-tight text-white mt-2">
                  {item.title || item.name}
                </h3>

                <p className="mt-2 text-sm text-white/75 line-clamp-3">
                  {item.overview}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="group/like absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover/item:opacity-100 
                     transition-all duration-300 ease-in-out hover:bg-black/50"
        >
          <div className="relative">
            <HeartIconSolid 
              className={`w-5 h-5 absolute inset-0 text-red-500 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                         scale-0 group-hover/like:scale-100 ${isLiked && 'scale-100'}`}
            />
            <HeartIcon 
              className={`w-5 h-5 text-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                         scale-100 group-hover/like:scale-0 ${isLiked && 'scale-0'}`}
            />
          </div>
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      <BackButton />

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
        <MediaRow title="Films" itemWidth={250}>
          {movies.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </MediaRow>

        <MediaRow title="Séries" itemWidth={250}>
          {tvShows.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </MediaRow>
      </div>
    </main>
  );
}

export default ProviderContent;
