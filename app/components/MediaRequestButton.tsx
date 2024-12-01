'use client';

import { useState, useEffect } from 'react';
import { getMediaStatus, requestMedia, cancelRequest, MEDIA_STATUS } from '../lib/overseerr';
import { ArrowPathIcon, PlusIcon, CheckIcon, XMarkIcon } from '../icons';

interface MediaRequestButtonProps {
  mediaType: string;
  mediaId: number;
}

export default function MediaRequestButton({ mediaType, mediaId }: MediaRequestButtonProps) {
  const [status, setStatus] = useState<number>(MEDIA_STATUS.UNKNOWN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getMediaStatus(mediaType, mediaId);
        setStatus(response.status);
        setRequestId(response.requestId);
      } catch (error) {
        console.error('Error fetching status:', error);
        setError('Failed to fetch status');
      }
    };

    fetchStatus();
  }, [mediaType, mediaId]);

  const handleRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await requestMedia({ mediaType, mediaId });
      const response = await getMediaStatus(mediaType, mediaId);
      setStatus(response.status);
      setRequestId(response.requestId);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await cancelRequest(requestId);
      setStatus(MEDIA_STATUS.NOT_AVAILABLE);
      setRequestId(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        color: 'bg-blue-500',
        text: 'En cours...',
        textColor: 'text-blue-500',
        icon: <ArrowPathIcon className="w-5 h-5 animate-spin" />,
        buttonText: 'En cours...'
      };
    }

    switch (status) {
      case MEDIA_STATUS.AVAILABLE:
        return {
          color: 'bg-green-500',
          text: 'Disponible',
          textColor: 'text-green-500',
          icon: <CheckIcon className="w-5 h-5" />,
          buttonText: null
        };
      case MEDIA_STATUS.PENDING:
      case MEDIA_STATUS.PROCESSING:
        return {
          color: 'bg-blue-500',
          text: 'En cours de traitement',
          textColor: 'text-blue-500',
          icon: <ArrowPathIcon className="w-5 h-5 animate-spin" />,
          buttonText: null,
          showCancel: true
        };
      case MEDIA_STATUS.NOT_AVAILABLE:
      default:
        return {
          color: 'bg-white',
          text: null,
          textColor: 'text-white',
          icon: <PlusIcon className="w-5 h-5" />,
          buttonText: 'Demander'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (status === MEDIA_STATUS.PENDING || status === MEDIA_STATUS.PROCESSING) {
    return (
      <div className="flex items-center space-x-2">
        <div className="inline-flex items-center h-12 px-6 rounded-full bg-white/10">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
            <span className="text-sm font-medium text-white/60">
              {statusInfo.text}
            </span>
            {statusInfo.icon && (
              <span className={statusInfo.textColor}>
                {statusInfo.icon}
              </span>
            )}
          </div>
        </div>
        
        {requestId && (
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full
                       bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-500
                       transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler la demande"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  if (status === MEDIA_STATUS.AVAILABLE) {
    return (
      <div className="inline-flex items-center h-12 px-6 rounded-full bg-white/10">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
          <span className="text-sm font-medium text-white/60">
            {statusInfo.text}
          </span>
          {statusInfo.icon && (
            <span className={statusInfo.textColor}>
              {statusInfo.icon}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={isLoading}
      className={`inline-flex items-center space-x-2 px-6 h-12 rounded-full
                 bg-white/10 hover:bg-white/15 backdrop-blur-md
                 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                 disabled:opacity-50 disabled:cursor-not-allowed
                 group relative overflow-hidden`}
    >
      <div className="relative z-10 flex items-center space-x-2">
        <span className={`${statusInfo.textColor} transition-transform group-hover:scale-110 duration-300`}>
          {statusInfo.icon}
        </span>
        <span className="text-sm font-medium text-white">
          {statusInfo.buttonText || statusInfo.text}
        </span>
      </div>
      <div className={`absolute inset-0 ${statusInfo.color} opacity-0 
                      group-hover:opacity-10 transition-opacity duration-300`} />
    </button>
  );
}
