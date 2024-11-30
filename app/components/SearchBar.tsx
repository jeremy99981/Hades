'use client';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '../hooks/useDebounce'
import { clientApi, getImageUrl, PROVIDER_IDS } from '../lib/tmdb'
import Image from 'next/image'

interface SearchResult {
  id: number
  title?: string
  name?: string
  media_type: 'movie' | 'tv'
  release_date?: string
  first_air_date?: string
  poster_path: string | null
}

interface Provider {
  id: number
  name: string
  color: string
}

const PROVIDERS: Provider[] = [
  { id: PROVIDER_IDS.netflix.provider, name: 'Netflix', color: 'bg-[#E50914]' },
  { id: PROVIDER_IDS.apple.provider, name: 'Apple TV+', color: 'bg-black' },
  { id: PROVIDER_IDS.disney.provider, name: 'Disney+', color: 'bg-[#113CCF]' },
  { id: PROVIDER_IDS.prime.provider, name: 'Prime Video', color: 'bg-[#00A8E1]' },
  { id: PROVIDER_IDS.hulu.provider, name: 'Hulu', color: 'bg-[#1CE783]' },
  { id: PROVIDER_IDS.paramount.provider, name: 'Paramount+', color: 'bg-[#0064FF]' },
]

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [trendingMovies, setTrendingMovies] = useState<SearchResult[]>([])
  const [trendingShows, setTrendingShows] = useState<SearchResult[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [providerContent, setProviderContent] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTrendingLoading, setIsTrendingLoading] = useState(false)
  const [isProviderLoading, setIsProviderLoading] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        if (inputRef.current) {
          inputRef.current.focus()
          setIsOpen(true)
        }
      } else if (event.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const data = await clientApi.searchContent(debouncedQuery)
        let filteredResults = data.results
          .filter((item: SearchResult) => item.media_type === 'movie' || item.media_type === 'tv')
          
        // If a provider is selected, we'll need to filter the results further
        // Note: This is a simplified filter. In a real app, you'd want to check the actual provider availability
        if (selectedProvider) {
          filteredResults = filteredResults.slice(0, 6)
        } else {
          filteredResults = filteredResults.slice(0, 6)
        }
        
        setResults(filteredResults)
      } catch (error) {
        console.error('Error fetching search results:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery, selectedProvider])

  useEffect(() => {
    const fetchProviderContent = async () => {
      if (!selectedProvider) return
      
      setIsProviderLoading(true)
      try {
        const content = await clientApi.getProviderContent(selectedProvider.id)
        setProviderContent(content.slice(0, 6))
      } catch (error) {
        console.error('Error fetching provider content:', error)
      } finally {
        setIsProviderLoading(false)
      }
    }

    if (selectedProvider) {
      fetchProviderContent()
    }
  }, [selectedProvider])

  useEffect(() => {
    const fetchTrending = async () => {
      setIsTrendingLoading(true)
      try {
        const [moviesData, showsData] = await Promise.all([
          clientApi.getTrending('movie', 'week'),
          clientApi.getTrending('tv', 'week')
        ])
        setTrendingMovies(moviesData.results.slice(0, 4))
        setTrendingShows(showsData.results.slice(0, 4))
      } catch (error) {
        console.error('Error fetching trending content:', error)
      } finally {
        setIsTrendingLoading(false)
      }
    }

    if (isOpen && query.length === 0) {
      fetchTrending()
    }
  }, [isOpen])

  return (
    <div ref={searchContainerRef} className="relative flex-1 max-w-3xl">
      <div className={`relative group ${isOpen ? 'z-50' : ''}`}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Rechercher un film ou une série..."
            className="w-full bg-[#1f1f1f]/40 backdrop-blur-xl text-white/90 placeholder-white/50 text-sm py-3 px-5 rounded-xl 
                     border border-white/10 outline-none transition-all duration-300
                     focus:bg-[#1f1f1f]/60 focus:border-white/20 focus:ring-2 focus:ring-white/10
                     hover:bg-[#1f1f1f]/50 hover:border-white/20"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/50">
            <span className="text-xs font-light">⌘K</span>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute mt-2 w-full bg-[#1f1f1f]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Provider Pills - Now inside dropdown */}
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(selectedProvider?.id === provider.id ? null : provider)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    selectedProvider?.id === provider.id
                      ? `${provider.color} text-white shadow-lg scale-105`
                      : 'bg-white/5 hover:bg-white/10 text-white/90 hover:text-white'
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2">
            {isLoading || isProviderLoading ? (
              // Loading State
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/20 border-r-2 border-white/20 border-b-2 border-white/20 border-l-2 border-white"></div>
              </div>
            ) : query.length > 0 && results.length > 0 ? (
              // Search Results Grid
              <div className="grid grid-cols-4 gap-3 p-3">
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} onClick={() => {
                    router.push(`/${result.media_type}/${result.id}`)
                    setIsOpen(false)
                    setQuery('')
                    setSelectedProvider(null)
                  }} />
                ))}
              </div>
            ) : query.length >= 2 && results.length === 0 ? (
              // No Results
              <div className="text-center py-8">
                <p className="text-white/50">Aucun résultat trouvé</p>
              </div>
            ) : selectedProvider ? (
              // Provider Content
              <div className="space-y-4 p-2">
                <h3 className="text-white/70 text-sm font-medium px-2">Contenu {selectedProvider.name}</h3>
                <div className="grid grid-cols-4 gap-3 p-3">
                  {providerContent.map((content) => (
                    <ResultCard key={content.id} result={content} onClick={() => {
                      router.push(`/${content.media_type}/${content.id}`)
                      setIsOpen(false)
                      setQuery('')
                      setSelectedProvider(null)
                    }} />
                  ))}
                </div>
              </div>
            ) : (
              // Trending Content
              <div className="space-y-6 p-2">
                {isTrendingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/20 border-r-2 border-white/20 border-b-2 border-white/20 border-l-2 border-white"></div>
                  </div>
                ) : (
                  < >
                    {/* Trending Movies Section */}
                    <div>
                      <h3 className="text-white/70 text-sm font-medium px-2 mb-3">Films Tendance</h3>
                      <div className="grid grid-cols-4 gap-3 p-3">
                        {trendingMovies.map((movie) => (
                          <ResultCard key={movie.id} result={movie} onClick={() => {
                            router.push(`/movie/${movie.id}`)
                            setIsOpen(false)
                            setQuery('')
                            setSelectedProvider(null)
                          }} />
                        ))}
                      </div>
                    </div>

                    {/* Trending Shows Section */}
                    <div>
                      <h3 className="text-white/70 text-sm font-medium px-2 mb-3">Séries Tendance</h3>
                      <div className="grid grid-cols-4 gap-3 p-3">
                        {trendingShows.map((show) => (
                          <ResultCard key={show.id} result={show} onClick={() => {
                            router.push(`/tv/${show.id}`)
                            setIsOpen(false)
                            setQuery('')
                            setSelectedProvider(null)
                          }} />
                        ))}
                      </div>
                    </div>
                  </ >
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ResultCard = ({ result, onClick }: { result: SearchResult, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer relative rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
  >
    <div className="relative aspect-[2/3]">
      {result.poster_path ? (
        <img
          src={getImageUrl(result.poster_path)}
          alt={result.title || result.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
          <span className="text-white/50 text-xs">No Image</span>
        </div>
      )}
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-white text-xs font-medium truncate">
            {result.title || result.name}
          </h3>
          <p className="text-white/70 text-[10px]">
            {result.media_type === 'movie' ? 'Film' : 'Série'} • {' '}
            {new Date(result.release_date || result.first_air_date || '').getFullYear() || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  </div>
)

export default SearchBar
