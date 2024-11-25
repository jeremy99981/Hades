import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';

// Cette instance sera utilisée côté serveur uniquement
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    language: 'fr-FR',
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const getImageUrl = (path: string, size: 'original' | 'w500' | 'w780' = 'w500') => {
  if (!path) return '';
  return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Les fonctions suivantes seront appelées côté serveur uniquement
export async function getTrending(mediaType: 'movie' | 'tv', timeWindow: 'day' | 'week' = 'week') {
  const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
  return response.data;
}

export async function getDetails(mediaType: 'movie' | 'tv', id: string) {
  const response = await tmdbApi.get(`/${mediaType}/${id}`, {
    params: {
      append_to_response: 'credits,videos,images,watch/providers',
    },
  });
  return response.data;
}

export async function getPopular(mediaType: 'movie' | 'tv', page: number = 1) {
  const response = await tmdbApi.get(`/${mediaType}/popular`, {
    params: {
      page,
    },
  });
  return response.data;
}

export async function getProviderContent(providerId: number) {
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
      const popularMoviesResponse = await tmdbApi.get('/movie/popular');
      const remainingMovies = popularMoviesResponse.data.results
        .filter((movie: any) => !movies.some((m: any) => m.id === movie.id))
        .slice(0, 10 - movies.length);
      movies = [...movies, ...remainingMovies];
    }

    // Si nous n'avons pas assez de séries tendances, récupérer des séries populaires
    let tvShows = trendingTvResponse.data.results.slice(0, 10);
    if (tvShows.length < 10) {
      const popularTvResponse = await tmdbApi.get('/tv/popular');
      const remainingTvShows = popularTvResponse.data.results
        .filter((show: any) => !tvShows.some((s: any) => s.id === show.id))
        .slice(0, 10 - tvShows.length);
      tvShows = [...tvShows, ...remainingTvShows];
    }

    // Ajouter le type de média à chaque élément
    movies = movies.map((item: any) => ({ ...item, media_type: 'movie' }));
    tvShows = tvShows.map((item: any) => ({ ...item, media_type: 'tv' }));

    return [...movies, ...tvShows];
  } catch (error) {
    console.error('Error fetching provider content:', error);
    throw error;
  }
}

export async function getTrendingByNetwork(networkId: number) {
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
    return response.data;
  } catch (error) {
    console.error('Error fetching network trending:', error);
    return { results: [] };
  }
}

export async function searchContent(query: string, page: number = 1) {
  const response = await tmdbApi.get('/search/multi', {
    params: {
      query,
      page,
    },
  });
  return response.data;
}

export async function getShowDetails(id: number) {
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
    
    return data;
  } catch (error) {
    console.error('Error fetching show details:', error);
    throw error;
  }
}

export async function getShowCredits(id: number) {
  const response = await tmdbApi.get(`/tv/${id}/credits`, {
    params: {
      language: 'fr-FR'
    }
  });
  return response.data;
}

export async function getSeasonDetails(showId: number, seasonNumber: number) {
  console.log(`Fetching season details for show ${showId}, season ${seasonNumber}`);
  try {
    const url = `${BASE_URL}/tv/${showId}/season/${seasonNumber}`;
    console.log('TMDB API URL:', url);
    
    const response = await tmdbApi.get(`/tv/${showId}/season/${seasonNumber}`, {
      params: {
        language: 'fr-FR',
        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY
      }
    });
    
    console.log('TMDB API Response Status:', response.status);
    console.log('TMDB API Response Data:', {
      name: response.data?.name,
      seasonNumber: response.data?.season_number,
      episodeCount: response.data?.episodes?.length
    });
    
    if (!response.data || !response.data.episodes) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from TMDB API');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching season details:', error);
    throw error;
  }
}

export async function getEpisodeDetails(showId: number, seasonNumber: number, episodeNumber: number) {
  const response = await tmdbApi.get(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`);
  return response.data;
}

export async function getShowVideos(id: number) {
  try {
    const response = await tmdbApi.get(`/tv/${id}/videos`, {
      params: {
        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
        language: 'fr-FR'
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching show videos:', error);
    return [];
  }
}

export default tmdbApi;
