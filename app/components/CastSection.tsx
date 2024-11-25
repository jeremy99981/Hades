'use client';

import Image from 'next/image'
import { getImageUrl } from '../lib/tmdb'

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface CastSectionProps {
  cast: CastMember[]
}

const CastSection = ({ cast }: CastSectionProps) => {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Distribution</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const container = document.getElementById('cast-container')
              if (container) {
                container.scrollLeft -= container.clientWidth - 100
              }
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => {
              const container = document.getElementById('cast-container')
              if (container) {
                container.scrollLeft += container.clientWidth - 100
              }
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
      <div className="relative">
        <div 
          id="cast-container"
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {cast.map((actor) => (
            <div
              key={actor.id}
              className="flex-none group"
            >
              {/* Actor Card */}
              <div className="w-[180px] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                {/* Image Container */}
                <div className="aspect-[3/4] overflow-hidden relative">
                  {actor.profile_path ? (
                    <Image
                      src={getImageUrl(actor.profile_path)}
                      alt={actor.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <svg 
                        className="w-16 h-16 text-white/30" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="p-4 space-y-1">
                  <h3 className="text-white font-medium text-base line-clamp-1">
                    {actor.name}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-1">
                    {actor.character}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Fade Effect */}
        <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-[#141414] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

export default CastSection
