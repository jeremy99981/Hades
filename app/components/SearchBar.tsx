'use client';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '../hooks/useDebounce'
import { clientApi, getImageUrl, PROVIDER_IDS } from '../lib/tmdb'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

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
  const [isLoading, setIsLoading] = useState(false)
  const [isTrendingLoading, setIsTrendingLoading] = useState(false)
  const [isProviderLoading, setIsProviderLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const fetchTrending = async () => {
      if (selectedProvider) {
        setIsTrendingLoading(true);
        try {
          const response = await clientApi.getProviderContent(selectedProvider.id.toString());
          const movies = response.results
            .filter(item => item.media_type === 'movie' && item.poster_path);
          const shows = response.results
            .filter(item => item.media_type === 'tv' && item.poster_path);
          setTrendingMovies(movies);
          setTrendingShows(shows);
        } catch (error) {
          console.error('Error fetching provider content:', error);
          setError('Failed to fetch provider content');
        } finally {
          setIsTrendingLoading(false);
        }
      } else {
        setIsTrendingLoading(true);
        try {
          const [moviesResponse, showsResponse] = await Promise.all([
            clientApi.getTrending('movie'),
            clientApi.getTrending('tv')
          ]);
          setTrendingMovies(moviesResponse.results.filter(item => item.poster_path));
          setTrendingShows(showsResponse.results.filter(item => item.poster_path));
        } catch (error) {
          console.error('Error fetching trending content:', error);
          setError('Failed to fetch trending content');
        } finally {
          setIsTrendingLoading(false);
        }
      }
    };

    fetchTrending();
  }, [selectedProvider]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await clientApi.searchContent(debouncedQuery);
        let filteredResults = response.results
          .filter((item: SearchResult) => (
            (item.media_type === 'movie' || item.media_type === 'tv') && 
            item.poster_path
          ));
        
        // Si un fournisseur est sélectionné, nous devons vérifier la disponibilité
        if (selectedProvider) {
          filteredResults = filteredResults.filter(item => 
            item.media_type === 'movie' || item.media_type === 'tv'
          );
        }
        
        setResults(filteredResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to fetch search results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, selectedProvider]);

  useEffect(() => {
    const fetchProviderContent = async () => {
      if (!selectedProvider) return
      
      setIsProviderLoading(true);
      try {
        const content = await clientApi.getProviderContent(selectedProvider.id.toString())
        // setProviderContent(content.results.slice(0, 6))
      } catch (error) {
        console.error('Error fetching provider content:', error)
      } finally {
        setIsProviderLoading(false);
      }
    }

    if (selectedProvider) {
      fetchProviderContent()
    }
  }, [selectedProvider])

  const handleResultClick = (result: SearchResult) => {
    router.push(`/${result.media_type}/${result.id}`)
    setIsOpen(false)
    setQuery('')
    setSelectedProvider(null)
  }

  return (
    <>
      {/* Bouton loupe dans la navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
          className="w-5 h-5 text-white/80">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <kbd className="hidden md:flex items-center gap-1 text-xs text-white/40">
          <span className="text-[10px]">⌘</span>
          <span className="text-[10px]">K</span>
        </kbd>
      </button>

      {/* Modal style Spotlight */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto pt-[15vh]">
            <div className="flex min-h-full items-start justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-[#1A1A1A]/90 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl transition-all">
                  <div className="flex flex-col h-[500px]">
                    <div className="flex items-center px-4 py-3 border-b border-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
                        stroke="currentColor" className="w-5 h-5 text-white/50 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-white/50 text-sm focus:outline-none"
                        placeholder="Rechercher un film ou une série..."
                        autoComplete="off"
                      />
                      {query && (
                        <button
                          onClick={() => setQuery('')}
                          className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                            strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/50">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <kbd className="hidden md:flex items-center gap-1 ml-3 px-2 py-1 text-[10px] font-mono text-white/40 
                        bg-white/10 rounded-md">
                        <span>ESC</span>
                      </kbd>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Sélecteur de fournisseur */}
                      <div className="flex-shrink-0 p-2 border-b border-white/10">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                          {PROVIDERS.map((provider) => (
                            <button
                              key={provider.id}
                              onClick={() => setSelectedProvider(selectedProvider?.id === provider.id ? null : provider)}
                              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                ${selectedProvider?.id === provider.id 
                                  ? `${provider.color} text-white ring-2 ring-white/20` 
                                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                            >
                              {provider.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zone de contenu avec hauteur dynamique */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="p-2">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-[300px]">
                              <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                            </div>
                          ) : query.length < 2 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
                              <div className="col-span-full">
                                <h3 className="text-sm font-medium text-white/40 mb-2">Films tendance</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {trendingMovies.slice(0, 3).map((movie) => (
                                    <ResultCard key={movie.id} result={movie} onClick={() => handleResultClick(movie)} />
                                  ))}
                                </div>
                              </div>
                              
                              <div className="col-span-full">
                                <h3 className="text-sm font-medium text-white/40 mb-2">Séries tendance</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {trendingShows.slice(0, 3).map((show) => (
                                    <ResultCard key={show.id} result={show} onClick={() => handleResultClick(show)} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : results.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
                              {results.slice(0, 6).map((result) => (
                                <ResultCard key={result.id} result={result} onClick={() => handleResultClick(result)} />
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-white/40">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                                strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                                <path strokeLinecap="round" strokeLinejoin="round" 
                                  d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                              </svg>
                              <p className="text-sm">Aucun résultat trouvé</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

const ResultCard = ({ result, onClick }: { result: SearchResult, onClick: () => void }) => {
  const title = result.title || result.name
  const date = result.release_date || result.first_air_date
  const year = date ? new Date(date).getFullYear() : null

  return (
    <button
      onClick={onClick}
      className="group relative w-full p-1 rounded-lg hover:bg-white/5 transition-colors text-left"
    >
      <div className="flex gap-3">
        <div className="relative w-12 h-[72px] rounded-md overflow-hidden bg-white/5 flex-shrink-0">
          {result.poster_path ? (
            <Image
              src={getImageUrl(result.poster_path, 'w92')}
              alt={title || 'poster'}
              className="object-cover"
              fill
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-white/20">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-white/40">
              {result.media_type === 'movie' ? 'Film' : 'Série'}
            </span>
            {year && (
              <>
                <span className="text-xs text-white/40">•</span>
                <span className="text-xs text-white/40">{year}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export default SearchBar
