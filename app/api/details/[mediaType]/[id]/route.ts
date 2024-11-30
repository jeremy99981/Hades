import { NextRequest, NextResponse } from 'next/server';
import { getDetails } from '@/app/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: { mediaType: 'movie' | 'tv'; id: string } }
) {
  try {
    const data = await getDetails(params.mediaType, params.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in details API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content details' },
      { status: 500 }
    );
  }
}
