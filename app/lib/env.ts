import { z } from 'zod';

const envSchema = z.object({
  TMDB_API_KEY: z.string().min(1, "TMDB API Key is required"),
  NEXT_PUBLIC_TMDB_IMAGE_BASE_URL: z.string().url("Invalid TMDB image base URL"),
  OVERSEERR_API_KEY: z.string().min(1, "Overseerr API Key is required"),
  OVERSEERR_URL: z.string().url("Invalid Overseerr URL"),
  NEXT_PUBLIC_BASE_URL: z.string().url("Invalid base URL"),
});

// Valider les variables d'environnement au démarrage
try {
  envSchema.parse({
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    NEXT_PUBLIC_TMDB_IMAGE_BASE_URL: process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL,
    OVERSEERR_API_KEY: process.env.OVERSEERR_API_KEY,
    OVERSEERR_URL: process.env.OVERSEERR_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:", error.errors);
    process.exit(1);
  }
}

// Exporter les variables d'environnement typées
export const env = {
  TMDB_API_KEY: process.env.TMDB_API_KEY!,
  NEXT_PUBLIC_TMDB_IMAGE_BASE_URL: process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL!,
  OVERSEERR_API_KEY: process.env.OVERSEERR_API_KEY!,
  OVERSEERR_URL: process.env.OVERSEERR_URL!,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
} as const;
