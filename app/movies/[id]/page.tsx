import Image from 'next/image'
import { getDetails, getImageUrl } from '@/app/lib/tmdb'
import CastSection from '@/app/components/CastSection'
import ClientTrailerButton from '@/app/components/ClientTrailerButton'
import BackButton from '@/app/components/BackButton'
import Recommendations from '@/app/components/Recommendations'
import MediaRequestButton from '@/app/components/MediaRequestButton'

async function MoviePage({ params }: { params: { id: string } }) {
  const movie = await getDetails('movie', params.id);
  const trailer = movie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube') || movie.videos?.results?.[0];
  const director = movie.credits?.crew?.find((person: any) => person.job === 'Director');

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      <BackButton />

      {/* Hero Section */}
      <div className="relative h-[100svh] w-full -mt-[var(--navbar-height)]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
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
            {movie.title}
          </h1>
          
          <div className="flex items-center space-x-4 text-sm text-white/90">
            <span className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {movie.vote_average?.toFixed(1)}
            </span>
            <span>•</span>
            <span>{new Date(movie.release_date).getFullYear()}</span>
            <span>•</span>
            <span>{movie.runtime} min</span>
          </div>

          <p className="max-w-3xl text-lg text-white/80">
            {movie.overview}
          </p>

          {director && (
            <p className="text-sm text-white/70">
              Réalisateur: <span className="text-white">{director.name}</span>
            </p>
          )}

          <div className="flex items-center space-x-4">
            <MediaRequestButton mediaType="movie" mediaId={parseInt(params.id)} />
            <ClientTrailerButton 
              trailerKey={trailer?.key}
              title={movie.title}
              year={new Date(movie.release_date).getFullYear().toString()}
            />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 px-8 space-y-12 py-12">
        {/* Cast Section */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <CastSection cast={movie.credits.cast} />
        )}

        {/* Recommendations Section */}
        <Recommendations mediaType="movie" mediaId={params.id} />
      </div>
    </main>
  );
}

export default MoviePage
