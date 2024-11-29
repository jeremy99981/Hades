'use client';

import { getTrending, getImageUrl, PROVIDER_IDS, getTrendingByNetwork } from './lib/tmdb';
import Link from 'next/link';
import Image from 'next/image';
import { PlayIcon, PlusIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import MediaRow from './components/MediaRow';
import MediaCard from './components/MediaCard';
import StreamingServiceCard from './components/StreamingServiceCard';

import { useEffect, useState } from 'react';

const streamingServicesConfig = [
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png',
    gradientFrom: '#E50914',
    gradientTo: '#B20710',
    providerId: PROVIDER_IDS.netflix.provider,
    networkId: PROVIDER_IDS.netflix.network
  },
  {
    name: 'Prime Video',
    logo: 'https://m.media-amazon.com/images/G/01/digital/video/acquisition/web_footer_logo._CB462908456_.png',
    gradientFrom: '#00A8E1',
    gradientTo: '#005C7A',
    providerId: PROVIDER_IDS.prime.provider,
    networkId: PROVIDER_IDS.prime.network
  },
  {
    name: 'Disney+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    gradientFrom: '#0063E5',
    gradientTo: '#0E3766',
    providerId: PROVIDER_IDS.disney.provider,
    networkId: PROVIDER_IDS.disney.network
  },
  {
    name: 'Apple TV+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    gradientFrom: '#000000',
    gradientTo: '#2D2D2D',
    providerId: PROVIDER_IDS.apple.provider,
    networkId: PROVIDER_IDS.apple.network
  },
  {
    name: 'Hulu',
    logo: 'https://press.hulu.com/wp-content/uploads/2020/02/hulu-white.png',
    gradientFrom: '#1CE783',
    gradientTo: '#168B52',
    providerId: PROVIDER_IDS.hulu.provider,
    networkId: PROVIDER_IDS.hulu.network
  },
  {
    name: 'Paramount+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Paramount_Plus.svg/1024px-Paramount_Plus.svg.png',
    gradientFrom: '#0064FF',
    gradientTo: '#003299',
    providerId: PROVIDER_IDS.paramount.provider,
    networkId: PROVIDER_IDS.paramount.network
  }
];

function Home() {
  const [trendingMovies, setTrendingMovies] = useState<any>({ results: [] });
  const [trendingTVShows, setTrendingTVShows] = useState<any>({ results: [] });
  const [networkShows, setNetworkShows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movies, shows] = await Promise.all([
          getTrending('movie'),
          getTrending('tv')
        ]);

        const networkShowsData = await Promise.all(
          streamingServicesConfig.map(service => 
            getTrendingByNetwork(service.networkId)
          )
        );

        setTrendingMovies(movies);
        setTrendingTVShows(shows);
        setNetworkShows(networkShowsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredMovie = trendingMovies.results[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  const streamingServicesWithShows = streamingServicesConfig.map((service, index) => ({
    ...service,
    trendingShow: networkShows[index]
  }));

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
              <button 
                className="flex items-center gap-2 px-8 py-3 bg-white/90 text-black font-medium rounded-lg hover:bg-white transition-colors duration-200"
              >
                <PlayIcon className="w-5 h-5" />
                Bande annonce
              </button>
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

export default Home;
