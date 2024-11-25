'use client';

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getSeasonDetails, getImageUrl } from '../lib/tmdb'
import EpisodeDetailModal from './EpisodeDetailModal'

interface Episode {
  id: number
  name: string
  overview: string
  still_path: string | null
  air_date: string
  episode_number: number
  vote_average: number
  season_number: number
  crew?: Array<{
    id: number
    name: string
    job: string
    profile_path: string | null
  }>
  guest_stars?: Array<{
    id: number
    name: string
    character: string
    profile_path: string | null
  }>
}

interface SeasonSectionProps {
  seriesId: string
  totalSeasons: number
}

const SeasonSection = ({ seriesId, totalSeasons }: SeasonSectionProps) => {
  console.log('SeasonSection mounted with props:', { seriesId, totalSeasons });
  
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasSpecials, setHasSpecials] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vérifier s'il y a une saison 0 (spéciaux)
  useEffect(() => {
    const checkSpecials = async () => {
      try {
        const data = await getSeasonDetails(parseInt(seriesId), 0)
        if (data.episodes && data.episodes.length > 0) {
          console.log('Found special episodes:', data.episodes.length);
          setHasSpecials(true)
        }
      } catch (error) {
        console.log('No special episodes found');
        setHasSpecials(false)
      }
    }
    checkSpecials()
  }, [seriesId])

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      console.log('Fetching season details:', { seriesId, selectedSeason });
      setLoading(true)
      setError(null)
      try {
        const data = await getSeasonDetails(parseInt(seriesId), selectedSeason)
        console.log('Season details response:', {
          episodes: data.episodes?.length,
          seasonNumber: data.season_number,
          name: data.name,
          overview: data.overview
        });
        
        if (data.episodes) {
          console.log('First episode:', data.episodes[0]);
          setEpisodes(data.episodes)
          console.log('Episodes set:', data.episodes.length);
        } else {
          console.log('No episodes in response');
          setEpisodes([]);
          setError('Aucun épisode trouvé pour cette saison')
        }
      } catch (error) {
        console.error('Error fetching season details:', error)
        setEpisodes([]);
        setError('Erreur lors du chargement des épisodes')
      }
      setLoading(false)
    }
    
    if (seriesId) {
      console.log('Starting fetch for season details');
      fetchSeasonDetails()
    } else {
      console.warn('No seriesId provided');
      setError('ID de série manquant')
    }
  }, [seriesId, selectedSeason])

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-emerald-500'
    if (rating >= 7) return 'bg-blue-500'
    if (rating >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleEpisodeClick = (episode: Episode) => {
    if (!episode.still_path && !episode.overview) return
    setSelectedEpisode(episode)
    setIsModalOpen(true)
  }

  const seasonOptions = [
    ...(hasSpecials ? [{ value: 0, label: 'Spéciaux' }] : []),
    ...Array.from({ length: totalSeasons }, (_, i) => ({
      value: i + 1,
      label: `Saison ${i + 1}`
    }))
  ];

  return (
    <div className="mt-16">
      {/* Season Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-semibold text-white">Épisodes</h2>
        <div className="w-full sm:w-auto">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="w-full sm:w-auto bg-white/10 text-white border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-white/20"
          >
            {seasonOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-white mt-8">Chargement des épisodes...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-red-500 mt-8">{error}</div>
      )}

      {/* Episodes List */}
      {!loading && !error && (
        <div className="space-y-6">
          {episodes.map((episode) => {
            const isComingSoon = !episode.still_path && !episode.overview
            
            return (
              <div
                key={episode.id}
                onClick={() => handleEpisodeClick(episode)}
                className={`flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors relative overflow-hidden group ${
                  !isComingSoon ? 'cursor-pointer hover:bg-white/10' : ''
                }`}
              >
                {/* Episode Image Container */}
                <div className="w-full sm:w-[300px] aspect-video rounded-lg overflow-hidden flex-shrink-0 relative">
                  {!isComingSoon && episode.vote_average > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                        <div className={`w-2 h-2 rounded-full ${getRatingColor(episode.vote_average)}`} />
                        <span className="text-sm font-medium text-white">
                          {episode.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {episode.still_path ? (
                    <Image
                      src={getImageUrl(episode.still_path)}
                      alt={episode.name}
                      width={533}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                      {isComingSoon ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white/50"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-white/50">
                            Disponible prochainement
                          </span>
                        </div>
                      ) : (
                        <svg
                          className="w-12 h-12 text-white/30"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Play Icon Overlay */}
                  {!isComingSoon && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <svg
                        className="w-16 h-16 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {episode.episode_number}. {episode.name}
                  </h3>
                  {episode.overview && (
                    <p className="text-white/70 text-sm line-clamp-3">
                      {episode.overview}
                    </p>
                  )}
                  {episode.air_date && (
                    <p className="text-sm text-white/40 mt-2">
                      {new Date(episode.air_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Episode Detail Modal */}
      {selectedEpisode && (
        <EpisodeDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedEpisode(null)
          }}
          episode={selectedEpisode}
        />
      )}
    </div>
  )
}

export default SeasonSection
