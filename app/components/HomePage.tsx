'use client';

import Link from 'next/link';
import Image from 'next/image';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import MediaRow from './MediaRow';
import MediaCard from './MediaCard';
import StreamingServiceCard from './StreamingServiceCard';
import ClientTrailerButton from './ClientTrailerButton';
import { getImageUrl } from '../lib/tmdb';

interface HomePageProps {
  trendingMovies: any;
  trendingTVShows: any;
  featuredMovie: any;
  trailer: any;
  streamingServicesWithShows: any[];
}

export default function HomePage({ 
  trendingMovies, 
  trendingTVShows, 
  featuredMovie, 
  trailer,
  streamingServicesWithShows 
}: HomePageProps) {
  return (
    <main className="min-h-screen bg-[#141414] text-white">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-screen w-full">
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(featuredMovie.backdrop_path, 'original')}
              alt={featuredMovie.title}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay amélioré pour une meilleure lisibilité avec la navbar */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#141414]" />
          </div>

          <div className="absolute bottom-[20%] left-0 right-0 px-8 space-y-6">
            <h1 className="text-[80px] font-bold text-white leading-none tracking-tight drop-shadow-lg max-w-4xl">
              {featuredMovie.title}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl line-clamp-3">
              {featuredMovie.overview}
            </p>
            <div className="flex items-center gap-3">
              <ClientTrailerButton 
                trailerKey={trailer?.key}
                title={featuredMovie.title}
                year={new Date(featuredMovie.release_date).getFullYear().toString()}
              />
              <Link 
                href={`/movie/${featuredMovie.id}`}
                className="flex items-center gap-2 px-8 py-3 bg-[rgba(255,255,255,0.1)] text-white font-medium rounded-lg hover:bg-[rgba(255,255,255,0.2)] backdrop-blur-sm transition-colors duration-200"
              >
                <InformationCircleIcon className="w-5 h-5" />
                Plus d'infos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="relative z-10 pb-24">
        {/* Trending TV Shows Section */}
        <section className="pt-24">
          <MediaRow title="Séries Tendances" itemWidth={250}>
            {trendingTVShows.results.slice(0, 12).map((show: any) => (
              <MediaCard key={show.id} item={{ ...show, media_type: 'tv' }} />
            ))}
          </MediaRow>
        </section>

        {/* Trending Movies Section */}
        <section className="mt-24">
          <MediaRow title="Films Tendances" itemWidth={250}>
            {trendingMovies.results.slice(0, 12).map((movie: any) => (
              <MediaCard key={movie.id} item={{ ...movie, media_type: 'movie' }} />
            ))}
          </MediaRow>
        </section>

        {/* Streaming Services Section */}
        <section className="mt-24 px-16">
          <h2 className="text-2xl font-medium text-white mb-6">
            Services de Streaming
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {streamingServicesWithShows.map((service) => {
              const featuredShow = service.trendingShow?.results?.[0];
              return (
                <StreamingServiceCard
                  key={service.providerId}
                  name={service.name}
                  logo={service.logo}
                  gradientFrom={service.gradientFrom}
                  gradientTo={service.gradientTo}
                  providerId={service.providerId}
                  featuredShowImage={featuredShow?.backdrop_path ? 
                    getImageUrl(featuredShow.backdrop_path, 'w1280') : 
                    ''}
                  featuredShowTitle={featuredShow?.name || featuredShow?.title || ''}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
