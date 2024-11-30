import { NextResponse } from 'next/server';
import { getTrending } from '@/app/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType') as 'movie' | 'tv';
    const timeWindow = searchParams.get('timeWindow') as 'day' | 'week' || 'week';

    if (!mediaType) {
      return NextResponse.json(
        { error: 'Media type is required' },
        { status: 400 }
      );
    }

    const data = await getTrending(mediaType, timeWindow);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
