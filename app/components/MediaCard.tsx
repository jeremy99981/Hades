import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import OverseerrStatus from './OverseerrStatus';

interface MediaCardProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    media_type: string;
    overview: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
  };
}

export default function MediaCard({ item }: MediaCardProps) {
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
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
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
}
