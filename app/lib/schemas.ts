import { z } from 'zod';

// Schéma pour les variables d'environnement
export const envSchema = z.object({
  TMDB_API_KEY: z.string().min(1),
  NEXT_PUBLIC_TMDB_IMAGE_BASE_URL: z.string().url(),
  OVERSEERR_API_KEY: z.string().min(1),
  OVERSEERR_URL: z.string().url(),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
});

// Schéma pour les médias (films et séries)
export const mediaSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  media_type: z.enum(['movie', 'tv']).optional(),  // Rendre optionnel pour tous les cas
  vote_average: z.number(),
  first_air_date: z.string().optional(),
  release_date: z.string().optional(),
  overview: z.string(),
});

// Schéma pour les détails d'un média
export const mediaDetailsSchema = mediaSchema.extend({
  genres: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  runtime: z.number().optional(),
  number_of_seasons: z.number().optional(),
  videos: z.object({
    results: z.array(
      z.object({
        key: z.string(),
        site: z.string(),
        type: z.string(),
      })
    ),
  }).optional(),
  credits: z.object({
    cast: z.array(z.object({
      id: z.number(),
      name: z.string(),
      character: z.string().optional(),
      profile_path: z.string().nullable(),
      order: z.number().optional(),
    })),
    crew: z.array(z.object({
      id: z.number(),
      name: z.string(),
      job: z.string(),
      profile_path: z.string().nullable(),
    })),
  }).optional(),
});

// Schéma pour les saisons
export const seasonSchema = z.object({
  air_date: z.string().nullable(),
  episode_count: z.number().optional(),
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  season_number: z.number(),
  episodes: z.array(z.object({
    air_date: z.string().nullable(),
    episode_number: z.number(),
    id: z.number(),
    name: z.string(),
    overview: z.string(),
    runtime: z.number().nullable().optional(),
    season_number: z.number(),
    still_path: z.string().nullable(),
    vote_average: z.number().optional(),
    crew: z.array(z.object({
      id: z.number(),
      name: z.string(),
      job: z.string(),
      profile_path: z.string().nullable()
    })).optional(),
    guest_stars: z.array(z.object({
      id: z.number(),
      name: z.string(),
      character: z.string(),
      profile_path: z.string().nullable()
    })).optional()
  })).optional(),
});

// Schéma pour les résultats de l'API TMDB
export const tmdbResponseSchema = z.object({
  page: z.number(),
  results: z.array(mediaSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

// Types dérivés des schémas
export type Media = z.infer<typeof mediaSchema>;
export type MediaDetails = z.infer<typeof mediaDetailsSchema>;
export type Season = z.infer<typeof seasonSchema>;
export type TMDBResponse = z.infer<typeof tmdbResponseSchema>;
