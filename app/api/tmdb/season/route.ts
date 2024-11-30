import { NextResponse } from 'next/server';
import { getSeasonDetails } from '@/app/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showId = searchParams.get('showId');
    const seasonNumber = searchParams.get('seasonNumber');

    if (!showId || seasonNumber === null) {
      return NextResponse.json(
        { error: 'Show ID and season number are required' },
        { status: 400 }
      );
    }

    const data = await getSeasonDetails(parseInt(showId), parseInt(seasonNumber));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching season details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
