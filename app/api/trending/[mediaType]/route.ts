import { NextRequest, NextResponse } from 'next/server';
import { getTrending } from '@/app/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: { mediaType: 'movie' | 'tv' } }
) {
  try {
    const data = await getTrending(params.mediaType);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in trending API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
}
