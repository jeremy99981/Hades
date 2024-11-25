import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string; seasonNumber: string } }
) {
  const { id, seasonNumber } = params
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${apiKey}&language=fr-FR`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch season details')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching season details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch season details' },
      { status: 500 }
    )
  }
}
