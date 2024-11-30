import { NextResponse } from 'next/server';
import { getProviderContent } from '@/app/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const data = await getProviderContent(parseInt(providerId));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching provider content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
