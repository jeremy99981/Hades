import { NextResponse } from 'next/server';

const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;
const OVERSEERR_URL = process.env.OVERSEERR_URL;

if (!OVERSEERR_API_KEY || !OVERSEERR_URL) {
  throw new Error('Missing Overseerr configuration in environment variables');
}

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
    console.log('Media Info from Overseerr:', mediaInfo);

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
    console.log('Requests Data from Overseerr:', requestsData);

    // Trouver une demande en cours pour ce média
    const pendingRequest = requestsData.results.find(
      (request: any) => 
        request.media.tmdbId === Number(mediaId) && 
        request.media.mediaType === mediaType &&
        request.status === 'PENDING'
    );

    // Déterminer le statut du média
    let status;

    if (mediaInfo.mediaInfo?.status === 5) {
      status = 5; // AVAILABLE
    } else if (mediaInfo.mediaInfo?.status === 3) {
      status = 3; // PROCESSING
    } else if (pendingRequest) {
      status = 2; // PENDING
    } else {
      status = 6; // NOT_AVAILABLE - Le média peut être demandé
    }

    return NextResponse.json({
      status,
      mediaId: Number(mediaId),
      mediaType,
      requestId: pendingRequest?.id
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check media status' },
      { status: 500 }
    );
  }
}
