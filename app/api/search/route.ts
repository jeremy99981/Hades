import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/app/lib/tmdb';
import { ZodError } from 'zod';
import { AxiosError } from 'axios';

export async function GET(request: NextRequest) {
  // Vérifier la clé API TMDB
  if (!process.env.TMDB_API_KEY) {
    console.error('[Search API] TMDB_API_KEY is not defined in environment variables');
    return NextResponse.json(
      { error: 'TMDB API is not properly configured' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    console.log('[Search API] Called with query:', query);
    console.log('[Search API] Using TMDB API key:', process.env.TMDB_API_KEY ? 'Present' : 'Missing');

    if (!query) {
      console.log('[Search API] No query parameter provided');
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('[Search API] Fetching search results from TMDB...');
    const data = await searchContent(query);
    console.log('[Search API] Search results received, count:', data.results.length);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Search API] Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      isAxiosError: error instanceof AxiosError,
      isZodError: error instanceof ZodError,
    });

    if (error instanceof AxiosError) {
      console.error('[Search API] Axios error response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
      });
      
      return NextResponse.json(
        { 
          error: 'TMDB API error',
          details: error.response?.data,
          message: error.message
        },
        { status: error.response?.status || 500 }
      );
    }

    if (error instanceof ZodError) {
      console.error('[Search API] Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch search results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
