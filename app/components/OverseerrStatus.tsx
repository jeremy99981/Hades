'use client';

import { useEffect, useState } from 'react';
import { getMediaStatus, MEDIA_STATUS } from '../lib/overseerr';

interface OverseerrStatusProps {
  mediaType: string;
  mediaId: number;
  className?: string;
}

export default function OverseerrStatus({ mediaType, mediaId, className = '' }: OverseerrStatusProps) {
  const [status, setStatus] = useState(MEDIA_STATUS.UNKNOWN);

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await getMediaStatus(mediaType, mediaId);
        setStatus(response.status);
      } catch (error) {
        console.error('Error checking media status:', error);
      }
    }

    checkStatus();
  }, [mediaType, mediaId]);

  const getStatusColor = () => {
    switch (status) {
      case MEDIA_STATUS.AVAILABLE:
        return 'bg-emerald-500/80';
      case MEDIA_STATUS.PARTIALLY_AVAILABLE:
        return 'bg-amber-500/80';
      case MEDIA_STATUS.PENDING:
      case MEDIA_STATUS.PROCESSING:
        return 'bg-blue-500/80';
      case MEDIA_STATUS.NOT_AVAILABLE:
        return 'bg-red-500/80';
      default:
        return 'bg-gray-500/80';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case MEDIA_STATUS.AVAILABLE:
        return 'Disponible';
      case MEDIA_STATUS.PARTIALLY_AVAILABLE:
        return 'Partiellement disponible';
      case MEDIA_STATUS.PENDING:
        return 'En attente';
      case MEDIA_STATUS.PROCESSING:
        return 'En cours';
      case MEDIA_STATUS.NOT_AVAILABLE:
        return 'Demander';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className={`absolute top-[0.875rem] left-3 z-10 ${className}`}>
      <div 
        className={`h-5 rounded-full ${getStatusColor()} backdrop-blur-md
                   transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                   w-5 group-hover/item:w-[120px]
                   flex items-center justify-center
                   shadow-[0_2px_8px_rgba(0,0,0,0.12)]
                   group-hover/item:shadow-[0_4px_12px_rgba(0,0,0,0.18)]
                   overflow-hidden`}
      >
        <span 
          className={`px-1 text-[13px] font-medium text-white/90
                     transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                     opacity-0 scale-75
                     group-hover/item:opacity-100 group-hover/item:scale-100
                     whitespace-nowrap tracking-wide`}
        >
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}
