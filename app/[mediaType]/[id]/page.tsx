import { getImageUrl, clientApi } from '@/app/lib/tmdb';
import Image from 'next/image';
import CastSection from '@/app/components/CastSection';
import ClientTrailerButton from '@/app/components/ClientTrailerButton';
import BackButton from '@/app/components/BackButton';
import Recommendations from '@/app/components/Recommendations';
import MediaRequestButton from '@/app/components/MediaRequestButton';

export default async function ContentDetails({ params }: { params: { mediaType: string; id: string } }) {
  const details = await clientApi.getDetails(params.mediaType as 'movie' | 'tv', params.id);
  const trailer = details.videos?.results?.find((video: any) => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  const cast = details.credits?.cast || [];
  const director = details.credits?.crew?.find((person: any) => 
    person.job === 'Director' || person.job === 'Creator'
  );

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      <BackButton />

      {/* Hero Section */}
      <div className="relative h-[100svh] w-full -mt-[var(--navbar-height)]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(details.backdrop_path, 'original')}
            alt={details.title || details.name}
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
            {details.title || details.name}
          </h1>
          
          <div className="flex items-center space-x-4 text-sm text-white/90">
            <span className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {details.vote_average?.toFixed(1)}
            </span>
            <span>•</span>
            <span>{details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
            {details.runtime && (
              <>
                <span>•</span>
                <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}min</span>
              </>
            )}
          </div>

          <p className="max-w-3xl text-lg text-white/80">
            {details.overview}
          </p>

          {director && (
            <p className="text-sm text-white/70 mb-4">
              {director.job === 'Director' ? 'Réalisateur' : 'Créateur'}: <span className="text-white">{director.name}</span>
            </p>
          )}

          <div className="flex items-end gap-4">
            <MediaRequestButton 
              mediaType={params.mediaType as 'movie' | 'tv'} 
              mediaId={parseInt(params.id)} 
            />
            <ClientTrailerButton 
              trailerKey={trailer?.key}
              title={details.title || details.name}
              year={(details.release_date || details.first_air_date)?.split('-')[0]}
            />
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {cast.length > 0 && (
        <section className="px-8 py-12">
          <CastSection cast={cast} director={director} />
        </section>
      )}

      {/* Recommendations Section */}
      <section className="px-8 py-12">
        <Recommendations mediaType={params.mediaType as 'movie' | 'tv'} mediaId={params.id} />
      </section>

      <div className="relative z-10">
        {/* Rest of the content */}
      </div>
    </main>
  );
}
