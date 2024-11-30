import { NextResponse } from 'next/server';
import { getTrending } from '@/app/lib/tmdb';
import { z } from 'zod';

const querySchema = z.object({
  mediaType: z.enum(['movie', 'tv']),
  timeWindow: z.enum(['day', 'week']).nullable().default('week'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType');
    const timeWindow = searchParams.get('timeWindow');

    console.log('Trending API - Query params:', { mediaType, timeWindow });

    if (!mediaType) {
      return NextResponse.json({ error: 'mediaType is required' }, { status: 400 });
    }

    const validatedParams = querySchema.parse({
      mediaType,
      timeWindow,
    });

    // On s'assure que timeWindow n'est jamais null après la validation
    const finalTimeWindow = validatedParams.timeWindow || 'week';

    console.log('Trending API - Final params:', { 
      mediaType: validatedParams.mediaType, 
      timeWindow: finalTimeWindow 
    });

    const data = await getTrending(validatedParams.mediaType, finalTimeWindow);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Trending API - Validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Trending API - Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
