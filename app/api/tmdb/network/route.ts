import { NextResponse } from 'next/server';
import { getTrendingByNetwork } from '@/app/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const networkId = searchParams.get('networkId');

    if (!networkId) {
      return NextResponse.json(
        { error: 'Network ID is required' },
        { status: 400 }
      );
    }

    const data = await getTrendingByNetwork(parseInt(networkId));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching network content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
