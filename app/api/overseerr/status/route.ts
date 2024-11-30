import { NextResponse } from 'next/server';

const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;
const OVERSEERR_URL = process.env.OVERSEERR_URL;

if (!OVERSEERR_API_KEY || !OVERSEERR_URL) {
  throw new Error('Missing Overseerr configuration in environment variables');
}

// Variable pour suivre si c'est le premier chargement
let isFirstLoad = true;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType');
    const mediaId = searchParams.get('mediaId');

    if (!mediaType || !mediaId) {
      return NextResponse.json(
        { error: 'Media type and ID are required' },
        { status: 400 }
      );
    }

    // Récupérer les informations du média depuis Overseerr
    const response = await fetch(
      `${OVERSEERR_URL}/api/v1/${mediaType}/${mediaId}`,
      {
        headers: {
          'X-Api-Key': OVERSEERR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get media info: ${response.statusText}`);
    }

    const mediaInfo = await response.json();

    // Vérifier s'il y a des demandes en cours pour ce média
    const requestsResponse = await fetch(
      `${OVERSEERR_URL}/api/v1/request?filter=all&sort=added&take=20`,
      {
        headers: {
          'X-Api-Key': OVERSEERR_API_KEY,
        },
      }
    );

    if (!requestsResponse.ok) {
      throw new Error(`Failed to get requests: ${requestsResponse.statusText}`);
    }

    const requestsData = await requestsResponse.json();

    // Ne logger que lors du premier chargement
    if (isFirstLoad && process.env.NODE_ENV === 'development') {
      console.log('Premier chargement - Données Overseerr:', {
        mediaInfo: {
          id: mediaInfo.id,
          status: mediaInfo.mediaInfo?.status,
          type: mediaType
        },
        requests: requestsData.results.map((req: any) => ({
          id: req.id,
          status: req.status,
          mediaId: req.media.tmdbId
        }))
      });
      isFirstLoad = false;
    }

    // Trouver une demande en cours pour ce média
    const pendingRequest = requestsData.results.find(
      (request: any) => 
        request.media.tmdbId === Number(mediaId) && 
        request.media.mediaType === mediaType &&
        request.status === 'PENDING'
    );

    // Déterminer le statut du média
    let status = 1; // UNKNOWN par défaut
    if (mediaInfo.mediaInfo) {
      if (mediaInfo.mediaInfo.status === 5) {
        status = 5; // AVAILABLE
      } else if (mediaInfo.mediaInfo.status === 3) {
        status = 3; // PROCESSING
      } else if (pendingRequest) {
        status = 2; // PENDING
      } else {
        status = 6; // NOT_AVAILABLE
      }
    }

    return NextResponse.json({
      status,
      mediaId: Number(mediaId),
      mediaType,
      requestId: pendingRequest?.id,
      mediaInfo: mediaInfo.mediaInfo
    });
  } catch (error) {
    console.error('Error in status check:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
