const OVERSEERR_API_KEY = 'MTcyMDU1MTgwMzU5OTkzMTY4NjVmLWUzOWEtNGM0My1iMDk1LTljMTZmNmJmMTAzOA==';

interface RequestOptions {
  mediaType: 'movie' | 'tv';
  mediaId: number;
}

interface RequestMediaParams {
  mediaType: string;
  mediaId: number;
}

interface MediaStatus {
  status: number;
  mediaId: number;
  mediaType: string;
  requestId?: number;
}

// Statuts possibles d'Overseerr
export const MEDIA_STATUS = {
  UNKNOWN: 1,        // Statut inconnu
  PENDING: 2,        // En attente
  PROCESSING: 3,     // En cours de traitement
  PARTIALLY_AVAILABLE: 4, // Partiellement disponible
  AVAILABLE: 5,      // Disponible
  NOT_AVAILABLE: 6,  // Non disponible
} as const;

// Cache pour stocker les statuts des médias
const mediaStatusCache = new Map<string, number>();

export const clearMediaStatusCache = (mediaType: string, mediaId: number) => {
  mediaStatusCache.delete(`${mediaType}-${mediaId}`);
};

export async function getMediaStatus(mediaType: string, mediaId: number): Promise<MediaStatus> {
  // Vérifier d'abord dans le cache
  const cacheKey = `${mediaType}-${mediaId}`;
  const cachedStatus = mediaStatusCache.get(cacheKey);
  
  if (cachedStatus !== undefined) {
    return { status: cachedStatus, mediaId, mediaType };
  }

  try {
    const response = await fetch(`/api/overseerr/status?mediaType=${mediaType}&mediaId=${mediaId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get media status');
    }

    // Stocker le statut dans le cache
    mediaStatusCache.set(cacheKey, data.status);

    return data;
  } catch (error) {
    console.error('Error getting media status:', error);
    return {
      status: MEDIA_STATUS.UNKNOWN,
      mediaId,
      mediaType
    };
  }
}

export async function requestMedia({ mediaType, mediaId }: RequestMediaParams) {
  try {
    const response = await fetch('/api/overseerr/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaType, mediaId }),
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error in requestMedia:', error);
    throw error;
  }
}

export async function checkMediaStatus(mediaId: number) {
  try {
    const response = await fetch(`/api/overseerr/media/${mediaId}`);

    if (!response.ok) {
      throw new Error('Failed to check media status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking media status:', error);
    throw error;
  }
}