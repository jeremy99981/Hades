import axios from 'axios';
import { 
  mediaSchema, 
  mediaDetailsSchema, 
  seasonSchema, 
  tmdbResponseSchema,
  type Media,
  type MediaDetails,
  type Season,
  type TMDBResponse
} from './schemas';

const BASE_URL = 'https://api.themoviedb.org/3';

// Cette instance sera utilisée côté serveur uniquement
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'fr-FR',
  },
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
  maxRedirects: 0,
  timeout: 5000,
});

// Ajouter des intercepteurs pour logger les requêtes et réponses
tmdbApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

tmdbApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Vérifier que l'API est correctement configurée
if (!process.env.TMDB_API_KEY) {
  console.error('[TMDB API] Error: TMDB_API_KEY is not defined in environment variables');
}

// Fonction pour tester la connexion à l'API TMDB
async function testTMDBConnection(): Promise<boolean> {
  try {
    await tmdbApi.get('/configuration');
    return true;
  } catch (error) {
    return false;
  }
}

// Tester la connexion au démarrage
testTMDBConnection();

export const PROVIDER_IDS = {
  netflix: {
    provider: 8,
    network: 213
  },
  prime: {
    provider: 9,
    network: 1024
  },
  hulu: {
    provider: 15,
    network: 453
  },
  disney: {
    provider: 337,
    network: 2739
  },
  apple: {
    provider: 350,
    network: 2552
  },
  paramount: {
    provider: 531,
    network: 4330
  }
};

// Fonction utilisable côté client car elle ne nécessite pas la clé API
export const getImageUrl = (path: string, size: 'original' | 'w500' | 'w780' = 'w500') => {
  if (!path) return '';
  return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Les fonctions suivantes seront appelées côté serveur uniquement
export async function getTrending(mediaType: 'movie' | 'tv', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse> {
  const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
  return tmdbResponseSchema.parse(response.data);
}

export async function getDetails(mediaType: 'movie' | 'tv', id: string): Promise<MediaDetails> {
  const response = await tmdbApi.get(`/${mediaType}/${id}`, {
    params: {
      append_to_response: 'credits,videos,images,watch/providers',
    },
  });
  return mediaDetailsSchema.parse(response.data);
}

export async function getPopular(mediaType: 'movie' | 'tv', page: number = 1): Promise<TMDBResponse> {
  const response = await tmdbApi.get(`/${mediaType}/popular`, {
    params: {
      page,
    },
  });
  return tmdbResponseSchema.parse(response.data);
}

export async function getProviderContent(providerId: number): Promise<TMDBResponse> {
  try {
    // Récupérer les films tendances du provider
    const trendingMoviesResponse = await tmdbApi.get('/discover/movie', {
      params: {
        with_watch_providers: providerId,
        watch_region: 'FR',
        sort_by: 'popularity.desc',
      },
    });

    // Récupérer les séries tendances du provider
    const trendingTvResponse = await tmdbApi.get('/discover/tv', {
      params: {
        with_watch_providers: providerId,
        watch_region: 'FR',
        sort_by: 'popularity.desc',
      },
    });

    // Si nous n'avons pas assez de films tendances, récupérer des films populaires
    let movies = trendingMoviesResponse.data.results.slice(0, 10);
    if (movies.length < 10) {
      const popularMoviesResponse = await tmdbApi.get('/movie/popular', {
        params: {
          watch_region: 'FR',
        },
      });
      const remainingMovies = popularMoviesResponse.data.results
        .filter((movie: any) => !movies.some((m: any) => m.id === movie.id))
        .slice(0, 10 - movies.length);
      movies = [...movies, ...remainingMovies];
    }

    // Si nous n'avons pas assez de séries tendances, récupérer des séries populaires
    let tvShows = trendingTvResponse.data.results.slice(0, 10);
    if (tvShows.length < 10) {
      const popularTvResponse = await tmdbApi.get('/tv/popular', {
        params: {
          watch_region: 'FR',
        },
      });
      const remainingTvShows = popularTvResponse.data.results
        .filter((show: any) => !tvShows.some((s: any) => s.id === show.id))
        .slice(0, 10 - tvShows.length);
      tvShows = [...tvShows, ...remainingTvShows];
    }

    // Ajouter le type de média à chaque élément
    movies = movies.map((item: any) => ({ 
      ...item, 
      media_type: 'movie',
      overview: item.overview || '',
      vote_average: item.vote_average || 0,
    }));

    tvShows = tvShows.map((item: any) => ({ 
      ...item, 
      media_type: 'tv',
      overview: item.overview || '',
      vote_average: item.vote_average || 0,
    }));

    // Mélanger les résultats
    const results = [...movies, ...tvShows].sort(() => Math.random() - 0.5);

    const response = {
      page: 1,
      results,
      total_pages: 1,
      total_results: results.length,
    };

    return tmdbResponseSchema.parse(response);
  } catch (error) {
    throw error;
  }
}

export async function getTrendingByNetwork(networkId: number): Promise<TMDBResponse> {
  try {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        with_networks: networkId,
        sort_by: 'popularity.desc',
        'vote_count.gte': 100,
        include_adult: false,
        page: 1
      }
    });
    return tmdbResponseSchema.parse(response.data);
  } catch (error) {
    console.error('Error fetching network trending:', error);
    return { results: [] };
  }
}

export async function searchContent(query: string, page: number = 1): Promise<TMDBResponse> {
  try {
    const response = await tmdbApi.get('/search/multi', {
      params: {
        query,
        page,
        include_adult: false,
      },
    });

    // Filtrer les résultats pour ne garder que les films et séries TV
    const filteredResults = response.data.results.filter(
      (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );

    // Mettre à jour les données avec les résultats filtrés
    const filteredData = {
      ...response.data,
      results: filteredResults,
    };

    return tmdbResponseSchema.parse(filteredData);
  } catch (error) {
    throw error;
  }
}

export async function getShowDetails(id: number): Promise<MediaDetails> {
  console.log('Fetching show details from TMDB API for ID:', id);
  try {
    const response = await tmdbApi.get(`/tv/${id}`, {
      params: {
        language: 'fr-FR',
        append_to_response: 'credits,videos,images,watch/providers'
      },
    });
    
    const data = response.data;
    console.log('TMDB API response:', {
      id: data.id,
      name: data.name,
      number_of_seasons: data.number_of_seasons,
      seasons: data.seasons?.map((s: any) => ({
        season_number: s.season_number,
        episode_count: s.episode_count
      }))
    });
    
    if (!data.number_of_seasons) {
      console.warn('Show has no seasons data:', data);
    }
    
    return mediaDetailsSchema.parse(data);
  } catch (error) {
    console.error('Error fetching show details:', error);
    throw error;
  }
}

export async function getShowCredits(id: number): Promise<any> {
  const response = await tmdbApi.get(`/tv/${id}/credits`, {
    params: {
      language: 'fr-FR'
    }
  });
  return response.data;
}

export async function getSeasonDetails(showId: number, seasonNumber: number): Promise<Season> {
  try {
    const response = await tmdbApi.get(`/tv/${showId}/season/${seasonNumber}`, {
      params: {
        language: 'fr-FR',
        append_to_response: 'credits,videos'
      }
    });

    if (!response.data) {
      throw new Error('No data received from TMDB API');
    }

    // Log pour debug
    console.log('TMDB API Season Response:', {
      statusCode: response.status,
      hasData: !!response.data,
      seasonNumber: response.data?.season_number,
      episodeCount: response.data?.episode_count,
      episodesCount: response.data?.episodes?.length,
      firstEpisodeGuests: response.data?.episodes?.[0]?.guest_stars?.length
    });

    return seasonSchema.parse(response.data);
  } catch (error) {
    console.error('Error fetching season details from TMDB:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Season ${seasonNumber} not found for show ${showId}`);
      }
      throw new Error(`TMDB API error: ${error.response?.status} ${error.response?.statusText}`);
    }
    throw error;
  }
}

export async function getEpisodeDetails(showId: number, seasonNumber: number, episodeNumber: number): Promise<any> {
  const response = await tmdbApi.get(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`);
  return response.data;
}

export async function getShowVideos(id: number): Promise<any[]> {
  try {
    const response = await tmdbApi.get(`/tv/${id}/videos`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'fr-FR'
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching show videos:', error);
    return [];
  }
}

export async function getMediaDetails(mediaType: string, id: string): Promise<MediaDetails> {
  const response = await tmdbApi.get(`/${mediaType}/${id}`);
  return mediaDetailsSchema.parse(response.data);
}

export async function getRecommendations(mediaType: 'movie' | 'tv', id: number): Promise<TMDBResponse> {
  const response = await tmdbApi.get(`/${mediaType}/${id}/recommendations`);
  const data = response.data;
  
  // Filter out items without posters
  data.results = data.results.filter((item: any) => item.poster_path);
  
  return tmdbResponseSchema.parse(data);
}

// Fonction utilitaire pour obtenir l'URL complète
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Côté client
    return window.location.origin;
  }
  // Côté serveur
  return 'http://localhost:3000';
}

// Les fonctions du client API avec des URLs complètes
export const clientApi = {
  async getTrending(mediaType: 'movie' | 'tv'): Promise<TMDBResponse> {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/trending/${mediaType}`);
    return tmdbResponseSchema.parse(response.data);
  },

  async getDetails(mediaType: 'movie' | 'tv', id: string): Promise<MediaDetails> {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/details/${mediaType}/${id}`);
    return mediaDetailsSchema.parse(response.data);
  },

  async getTrendingByNetwork(networkId: string): Promise<TMDBResponse> {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/network/${networkId}`);
    return tmdbResponseSchema.parse(response.data);
  },

  async getProviderContent(providerId: string): Promise<TMDBResponse> {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/provider/${providerId}`);
    return tmdbResponseSchema.parse(response.data);
  },

  async getSeasonDetails(tvId: string, seasonNumber: string): Promise<Season> {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/tv/${tvId}/season/${seasonNumber}`);
    return seasonSchema.parse(response.data);
  },

  async searchContent(query: string): Promise<TMDBResponse> {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/search`, {
      params: { query }
    });
    return tmdbResponseSchema.parse(response.data);
  },

  async getRecommendations(mediaType: 'movie' | 'tv', id: string): Promise<TMDBResponse> {
    return fetch(`${getBaseUrl()}/api/${mediaType}/${id}/recommendations`)
      .then(res => res.json())
      .then(data => {
        // Filter out items without posters
        data.results = data.results.filter((item: any) => item.poster_path);
        return tmdbResponseSchema.parse(data);
      });
  }
};

export default tmdbApi;
