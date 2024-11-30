'use client';

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getImageUrl } from '../lib/tmdb'

interface EpisodeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  episode: {
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
}

const EpisodeDetailModal = ({ isOpen, onClose, episode }: EpisodeDetailModalProps) => {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  if (!isOpen) return null

  const directors = episode.crew?.filter(member => member.job === 'Director') || []
  const writers = episode.crew?.filter(member => member.job === 'Writer') || []

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] shadow-2xl ${
          isClosing ? 'animate-slideOut' : 'animate-slideIn'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white/70 hover:text-white transition-colors"
          onClick={handleClose}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Section */}
        <div className="relative aspect-video">
          {episode.still_path ? (
            <>
              <Image
                src={getImageUrl(episode.still_path, 'original')}
                alt={episode.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 text-white/60 text-sm mb-2">
              <span>Épisode {episode.episode_number}</span>
              <span>•</span>
              <span>{new Date(episode.air_date).toLocaleDateString('fr-FR')}</span>
              {episode.vote_average > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                    <span>{episode.vote_average.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
            <h2 className="text-3xl font-semibold text-white">{episode.name}</h2>
          </div>

          {/* Overview */}
          {episode.overview && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Synopsis</h3>
              <p className="text-white/70 leading-relaxed">{episode.overview}</p>
            </div>
          )}

          {/* Crew */}
          {(directors.length > 0 || writers.length > 0) && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Équipe technique</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {directors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white/40 mb-3">Réalisation</h4>
                    <div className="space-y-3">
                      {directors.map(director => (
                        <div key={director.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                          {director.profile_path ? (
                            <Image
                              src={getImageUrl(director.profile_path)}
                              alt={director.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                              <span className="text-white/30 text-lg font-medium">
                                {director.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-white/90 font-medium">{director.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {writers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white/40 mb-3">Scénario</h4>
                    <div className="space-y-3">
                      {writers.map(writer => (
                        <div key={writer.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                          {writer.profile_path ? (
                            <Image
                              src={getImageUrl(writer.profile_path)}
                              alt={writer.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                              <span className="text-white/30 text-lg font-medium">
                                {writer.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-white/90 font-medium">{writer.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guest Stars */}
          {episode.guest_stars && episode.guest_stars.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Casting invité</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {episode.guest_stars.map(actor => (
                  <div key={actor.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                    {actor.profile_path ? (
                      <Image
                        src={getImageUrl(actor.profile_path)}
                        alt={actor.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="text-white/30 text-lg font-medium">
                          {actor.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-white/90 font-medium">{actor.name}</div>
                      <div className="text-white/50 text-sm">{actor.character}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EpisodeDetailModal
