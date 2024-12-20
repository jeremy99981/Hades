import Image from 'next/image'
import { getShowDetails, getShowCredits, getShowVideos, getImageUrl } from '@/app/lib/tmdb'
import CastSection from '@/app/components/CastSection'
import SeasonSection from '@/app/components/SeasonSection'
import ClientTrailerButton from '@/app/components/ClientTrailerButton'
import BackButton from '@/app/components/BackButton'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Recommendations from '@/app/components/Recommendations'
import MediaRequestButton from '@/app/components/MediaRequestButton'

async function SeriesPage({ params }: { params: { id: string } }) {
  const [show, credits, videos] = await Promise.all([
    getShowDetails(parseInt(params.id)),
    getShowCredits(parseInt(params.id)),
    getShowVideos(parseInt(params.id))
  ]);

  const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube') || videos[0];
  const creator = credits.crew?.find((person: any) => person.job === 'Creator');

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      <BackButton />

      {/* Hero Section */}
      <div className="relative h-[100svh] w-full -mt-[var(--navbar-height)]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(show.backdrop_path, 'original')}
            alt={show.name}
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="(max-width: 768px) 200vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
          <h1 className="text-5xl sm:text-[80px] font-bold text-white leading-none tracking-tight drop-shadow-lg">
            {show.name}
          </h1>
          
          <div className="flex items-center space-x-4 text-sm text-white/90">
            <span className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {show.vote_average?.toFixed(1)}
            </span>
            <span>•</span>
            <span>{new Date(show.first_air_date).getFullYear()}</span>
            <span>•</span>
            <span>{show.number_of_seasons} saison{show.number_of_seasons > 1 ? 's' : ''}</span>
          </div>

          <p className="max-w-3xl text-lg text-white/80">
            {show.overview}
          </p>

          {creator && (
            <p className="text-sm text-white/70">
              Créateur: <span className="text-white">{creator.name}</span>
            </p>
          )}

          <div className="flex items-center space-x-4">
            <MediaRequestButton mediaType="tv" mediaId={parseInt(params.id)} />
            <ClientTrailerButton 
              trailerKey={trailer?.key}
              title={show.name}
              year={new Date(show.first_air_date).getFullYear().toString()}
            />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 px-8 space-y-12 py-12">
        {/* Cast Section */}
        {credits.cast && credits.cast.length > 0 && (
          <CastSection cast={credits.cast} />
        )}
        
        {/* Season Section */}
        {show.number_of_seasons > 0 && (
          <SeasonSection 
            seriesId={params.id} 
            totalSeasons={show.number_of_seasons} 
          />
        )}

        {/* Recommendations Section */}
        <Recommendations mediaType="tv" mediaId={params.id} />
      </div>
    </main>
  );
}

export default SeriesPage
