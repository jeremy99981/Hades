import Image from 'next/image'
import { getShowDetails, getShowCredits, getShowVideos, getImageUrl } from '@/app/lib/tmdb'
import CastSection from '@/app/components/CastSection'
import SeasonSection from '@/app/components/SeasonSection'
import SeriesTrailerButton from '@/app/components/SeriesTrailerButton'

async function SeriesPage({ params }: { params: { id: string } }) {
  const [show, credits, videos] = await Promise.all([
    getShowDetails(parseInt(params.id)),
    getShowCredits(parseInt(params.id)),
    getShowVideos(parseInt(params.id))
  ]);

  const trailer = videos.find(video => video.type === 'Trailer') || videos[0];

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero Section */}
      <div className="relative h-[80vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(show.backdrop_path, 'original')}
            alt={show.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-4">
              {show.name}
            </h1>
            <div className="flex items-center gap-4 text-white/60 mb-6">
              <span>{new Date(show.first_air_date).getFullYear()}</span>
              <span>•</span>
              <span>{show.number_of_seasons} saison{show.number_of_seasons > 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{show.vote_average.toFixed(1)}/10</span>
            </div>
            <p className="text-lg text-white/90 max-w-3xl mb-6">
              {show.overview}
            </p>
            {trailer && <SeriesTrailerButton trailerKey={trailer.key} />}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-8">
        {/* Cast Section */}
        {credits.cast && <CastSection cast={credits.cast} />}
        
        {/* Season Section */}
        {show.number_of_seasons > 0 && (
          <SeasonSection 
            seriesId={params.id} 
            totalSeasons={show.number_of_seasons} 
          />
        )}
      </div>
    </div>
  );
}

export default SeriesPage
