import { NextResponse } from 'next/server';
import { getProviderContent } from '@/app/lib/tmdb';
import { z } from 'zod';

const querySchema = z.object({
  providerId: z.string().transform(Number),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    const validatedParams = querySchema.parse({
      providerId,
    });

    const data = await getProviderContent(validatedParams.providerId);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in provider route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
