import { NextResponse } from 'next/server';
import axios from 'axios';
import { tmdbResponseSchema } from '@/app/lib/schemas';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(
  request: Request,
  { params }: { params: { mediaType: string; id: string } }
) {
  if (!params.mediaType || !params.id) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  if (params.mediaType !== 'movie' && params.mediaType !== 'tv') {
    return NextResponse.json(
      { error: 'Invalid media type. Must be "movie" or "tv"' },
      { status: 400 }
    );
  }

  try {
    console.log(`Fetching recommendations for ${params.mediaType} ${params.id}`);
    
    const response = await axios.get(
      `${BASE_URL}/${params.mediaType}/${params.id}/recommendations`,
      {
        params: {
          api_key: TMDB_API_KEY,
          language: 'fr-FR',
        },
      }
    );

    const recommendations = tmdbResponseSchema.parse(response.data);
    console.log(`Successfully fetched ${recommendations.results.length} recommendations`);
    
    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error('Error fetching recommendations:', error.message);
    if (error.response) {
      console.error('TMDB API response:', error.response.data);
    }
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    );
  }
}
