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
        <div className="relative h-[100svh] w-full -mt-[var(--navbar-height)]">
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(featuredMovie.backdrop_path, 'original')}
              alt={featuredMovie.title}
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="(max-width: 768px) 200vw, 100vw"
            />
            {/* Gradient overlay optimisé pour la notch et la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/50 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-[80px] font-bold text-white leading-tight md:leading-none tracking-tight drop-shadow-lg max-w-4xl">
                {featuredMovie.title}
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-2xl line-clamp-3 drop-shadow-lg">
                {featuredMovie.overview}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <ClientTrailerButton 
                  trailerKey={trailer?.key}
                  title={featuredMovie.title}
                  year={new Date(featuredMovie.release_date).getFullYear().toString()}
                />
                <Link 
                  href={`/movie/${featuredMovie.id}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[rgba(255,255,255,0.1)] text-white font-medium rounded-lg hover:bg-[rgba(255,255,255,0.2)] backdrop-blur-sm transition-colors duration-200"
                >
                  <InformationCircleIcon className="w-5 h-5" />
                  Plus d'infos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="relative z-10 pb-12 md:pb-24">
        {/* Trending TV Shows Section */}
        <section className="pt-12 md:pt-24 px-4 md:px-0">
          <MediaRow title="Séries Tendances" itemWidth={200} className="snap-x">
            {trendingTVShows.results.slice(0, 12).map((show: any) => (
              <div key={show.id} className="snap-start">
                <MediaCard item={{ ...show, media_type: 'tv' }} />
              </div>
            ))}
          </MediaRow>
        </section>

        {/* Trending Movies Section */}
        <section className="mt-12 md:mt-24 px-4 md:px-0">
          <MediaRow title="Films Tendances" itemWidth={200} className="snap-x">
            {trendingMovies.results.slice(0, 12).map((movie: any) => (
              <div key={movie.id} className="snap-start">
                <MediaCard item={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </MediaRow>
        </section>

        {/* Streaming Services Section */}
        <section className="mt-12 md:mt-24 px-4 md:px-16">
          <h2 className="text-xl md:text-2xl font-medium text-white mb-4 md:mb-6">
            Services de Streaming
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
