import { NextResponse } from 'next/server';
import { getDetails } from '@/app/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType') as 'movie' | 'tv';
    const id = searchParams.get('id');

    if (!mediaType || !id) {
      return NextResponse.json(
        { error: 'Media type and ID are required' },
        { status: 400 }
      );
    }

    const data = await getDetails(mediaType, id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
