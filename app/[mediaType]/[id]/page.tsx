import { getMediaDetails } from '@/app/lib/tmdb';
import Image from 'next/image';

interface PageProps {
  params: {
    mediaType: string;
    id: string;
  };
}

export default async function MediaDetailsPage({ params }: PageProps) {
  const { mediaType, id } = params;
  const details = await getMediaDetails(mediaType, id);

  const title = mediaType === 'movie' ? details.title : details.name;
  const releaseDate = mediaType === 'movie' ? details.release_date : details.first_air_date;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-1/3">
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden">
            <Image
              src={`https://image.tmdb.org/t/p/original${details.poster_path}`}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>
        </div>

        {/* Détails */}
        <div className="w-full md:w-2/3">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          
          <div className="mb-4 text-gray-500">
            <span>{new Date(releaseDate).getFullYear()}</span>
            {details.runtime && (
              <span className="ml-4">{Math.floor(details.runtime / 60)}h {details.runtime % 60}min</span>
            )}
            {details.number_of_seasons && (
              <span className="ml-4">{details.number_of_seasons} saison{details.number_of_seasons > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
            <p className="text-gray-700">{details.overview}</p>
          </div>

          {details.genres && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Note</h2>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {Math.round(details.vote_average * 10) / 10}
              </span>
              <span className="text-gray-500 ml-2">/ 10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
