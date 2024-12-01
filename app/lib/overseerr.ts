import { env } from 'process';

const OVERSEERR_API_KEY = env.OVERSEERR_API_KEY;

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
  UNKNOWN: 6,        // Remplacer UNKNOWN par NOT_AVAILABLE
  PENDING: 2,        // En attente
  PROCESSING: 3,     // En cours de traitement
  PARTIALLY_AVAILABLE: 4, // Partiellement disponible
  AVAILABLE: 5,      // Disponible
  NOT_AVAILABLE: 6,  // Non disponible / Peut être demandé
} as const;

// Cache pour stocker les statuts des médias
const mediaStatusCache = new Map<string, number>();

export const clearMediaStatusCache = (mediaType: string, mediaId: number) => {
  mediaStatusCache.delete(`${mediaType}-${mediaId}`);
};

export async function getMediaStatus(mediaType: string, mediaId: number) {
  try {
    const response = await fetch(`/api/overseerr/status?mediaType=${mediaType}&mediaId=${mediaId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get media status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting media status:', error);
    throw error;
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

export async function cancelRequest(requestId: number) {
  try {
    const response = await fetch('/api/overseerr/request/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Failed to cancel request`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling request:', error);
    throw error;
  }
}
