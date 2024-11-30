import { NextResponse } from 'next/server';
import { getSeasonDetails } from '@/app/lib/tmdb';
import { z } from 'zod';

const querySchema = z.object({
  tvId: z.string().transform(Number),
  seasonNumber: z.string().transform(Number),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tvId = searchParams.get('tvId');
    const seasonNumber = searchParams.get('seasonNumber');

    console.log('Season API - Query params:', { tvId, seasonNumber });

    if (!tvId || !seasonNumber) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        details: { tvId: !tvId, seasonNumber: !seasonNumber }
      }, { status: 400 });
    }

    const validatedParams = querySchema.parse({
      tvId,
      seasonNumber,
    });

    console.log('Season API - Validated params:', validatedParams);

    try {
      const data = await getSeasonDetails(validatedParams.tvId, validatedParams.seasonNumber);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Season API - TMDB error:', error);
      
      // Si l'erreur contient "not found", on retourne 404
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ 
          error: 'Season not found',
          details: error.message 
        }, { status: 404 });
      }

      // Pour les autres erreurs TMDB
      return NextResponse.json({ 
        error: 'Failed to fetch season data from TMDB',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Season API - Validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Season API - Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
