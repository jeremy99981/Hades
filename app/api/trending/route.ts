import { NextResponse } from 'next/server';
import { getTrending, getTrendingByNetwork } from '../../lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const networkId = searchParams.get('networkId');

    if (networkId) {
      const data = await getTrendingByNetwork(Number(networkId));
      return NextResponse.json(data);
    }

    if (type === 'all') {
      const [movies, shows] = await Promise.all([
        getTrending('movie'),
        getTrending('tv')
      ]);
      return NextResponse.json({ movies, shows });
    }

    const data = await getTrending(type as 'movie' | 'tv');
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
