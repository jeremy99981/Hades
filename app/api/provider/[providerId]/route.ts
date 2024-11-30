import { NextRequest, NextResponse } from 'next/server';
import { getProviderContent } from '@/app/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const data = await getProviderContent(Number(params.providerId));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in provider API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider content' },
      { status: 500 }
    );
  }
}
