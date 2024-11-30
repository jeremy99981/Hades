import { NextRequest, NextResponse } from 'next/server';
import { getSeasonDetails } from '@/app/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: { tvId: string; seasonNumber: string } }
) {
  try {
    const data = await getSeasonDetails(Number(params.tvId), Number(params.seasonNumber));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in season details API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch season details' },
      { status: 500 }
    );
  }
}
