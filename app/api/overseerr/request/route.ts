import { NextResponse } from 'next/server';

const OVERSEERR_API_KEY = 'MTcyMDU1MTgwMzU5OTkzMTY4NjVmLWUzOWEtNGM0My1iMDk1LTljMTZmNmJmMTAzOA==';
const OVERSEERR_URL = 'http://192.168.1.33:5055';

// Chemins des dossiers racines pour votre configuration
const ROOT_FOLDERS = {
  tv: '/mnt/plex/Series',
  movie: '/mnt/plex/Movies'
};

async function getMediaInfo(mediaType: string, mediaId: number) {
  try {
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

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse media info response:', text);
      throw new Error('Invalid JSON response from media info');
    }
  } catch (error) {
    console.error('Error getting media info:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mediaType, mediaId } = body;

    console.log('Starting media request process for:', {
      mediaType,
      mediaId,
    });

    // Récupérer les informations du média
    const mediaInfo = await getMediaInfo(mediaType, mediaId);
    console.log('Retrieved media info:', mediaInfo);

    const requestBody = {
      mediaId: Number(mediaId),
      mediaType,
      // Pour les séries TV, on demande toutes les saisons
      ...(mediaType === 'tv' && {
        seasons: "all"
      }),
      // Paramètres de base
      is4k: false,
      userId: 1,
      // Chemins des dossiers selon le type de média
      rootFolder: ROOT_FOLDERS[mediaType === 'tv' ? 'tv' : 'movie']
    };

    console.log('Sending request to Overseerr with body:', requestBody);

    const response = await fetch(`${OVERSEERR_URL}/api/v1/request`, {
      method: 'POST',
      headers: {
        'X-Api-Key': OVERSEERR_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Raw response from Overseerr:', responseText);

    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from Overseerr' },
        { status: 500 }
      );
    }

    console.log('Overseerr response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.message || 'Request failed' },
        { status: response.status }
      );
    }

    // Si la réponse est vide mais le statut est OK, on renvoie un succès
    if (response.ok && !responseText) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in request handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
