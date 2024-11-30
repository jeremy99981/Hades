import { NextResponse } from 'next/server';
import { getMediaDetails } from '@/app/lib/tmdb';
import { z } from 'zod';

const querySchema = z.object({
  mediaType: z.enum(['movie', 'tv']),
  id: z.string(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType');
    const id = searchParams.get('id');

    const validatedParams = querySchema.parse({
      mediaType,
      id,
    });

    const data = await getMediaDetails(validatedParams.mediaType, validatedParams.id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in details route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
