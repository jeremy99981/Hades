import { NextRequest, NextResponse } from 'next/server';
import { getTrendingByNetwork } from '@/app/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    const data = await getTrendingByNetwork(Number(params.networkId));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in network API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network content' },
      { status: 500 }
    );
  }
}
