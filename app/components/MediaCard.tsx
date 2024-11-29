import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { requestMedia, getMediaStatus, clearMediaStatusCache, MEDIA_STATUS } from '../lib/overseerr';
import { toast } from 'react-hot-toast';

interface MediaCardProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    media_type: string;
    overview: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
  };
}

export default function MediaCard({ item }: MediaCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [mediaStatus, setMediaStatus] = useState<number>(MEDIA_STATUS.UNKNOWN);

  // Vérifier le statut du média uniquement au chargement
  useEffect(() => {
    const checkStatus = async () => {
      const status = await getMediaStatus(item.media_type, item.id);
      setMediaStatus(status.status);
      if (status.requestId) {
        setRequestId(status.requestId);
      }
    };

    checkStatus();
  }, [item.media_type, item.id]);

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRequesting || mediaStatus === MEDIA_STATUS.AVAILABLE) return;

    setIsRequesting(true);
    try {
      const response = await requestMedia({
        mediaType: item.media_type,
        mediaId: item.id,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setRequestId(response.id);
      setMediaStatus(MEDIA_STATUS.PENDING);
      // Effacer le cache pour ce média après une demande réussie
      clearMediaStatusCache(item.media_type, item.id);
      toast.success('Demande envoyée avec succès !', {
        duration: 5000,
        icon: '✓',
      });
    } catch (error) {
      console.error('Error requesting media:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erreur lors de la demande. Veuillez réessayer.',
        {
          duration: 5000,
          icon: '⚠️',
        }
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCanceling || !requestId) return;

    setIsCanceling(true);
    try {
      const response = await fetch(`/api/overseerr/cancel?requestId=${requestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel request');
      }

      setRequestId(null);
      setMediaStatus(MEDIA_STATUS.NOT_AVAILABLE);
      // Effacer le cache pour ce média après une annulation réussie
      clearMediaStatusCache(item.media_type, item.id);
      toast.success('Demande annulée avec succès !', {
        duration: 5000,
        icon: '✓',
      });
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erreur lors de l\'annulation. Veuillez réessayer.',
        {
          duration: 5000,
          icon: '⚠️',
        }
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusButton = () => {
    switch (mediaStatus) {
      case MEDIA_STATUS.AVAILABLE:
        return (
          <div className="flex items-center justify-center w-full gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg">
            Disponible
          </div>
        );
      case MEDIA_STATUS.PENDING:
        return (
          <button
            onClick={handleCancel}
            disabled={isCanceling}
            className="flex items-center justify-center w-full gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg 
                     hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCanceling ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Annuler'
            )}
          </button>
        );
      case MEDIA_STATUS.PROCESSING:
        return (
          <div className="flex items-center justify-center w-full gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg">
            En cours...
          </div>
        );
      default:
        return (
          <button
            onClick={handleRequest}
            disabled={isRequesting}
            className="flex items-center justify-center w-full gap-1.5 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg 
                     hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequesting ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              'Demander'
            )}
          </button>
        );
    }
  };

  return (
    <div
      className="relative p-[2px] rounded-[10px] overflow-hidden group/item flex-shrink-0"
      style={{ width: '250px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="relative rounded-[10px] overflow-hidden">
        <Link href={`/${item.media_type}/${item.id}`}>
          <Image
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={item.title || item.name || ''}
            width={250}
            height={375}
            sizes="250px"
            quality={90}
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover/item:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center space-x-2 text-[13px] text-white/90">
                <span className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  {item.vote_average?.toFixed(1)}
                </span>
                <span>•</span>
                <span>
                  {new Date(
                    item.release_date || item.first_air_date || ''
                  ).getFullYear()}
                </span>
              </div>

              <h3 className="font-semibold text-xl leading-tight text-white mt-2">
                {item.title || item.name}
              </h3>
              <div className="mt-4">
                {getStatusButton()}
              </div>
            </div>
          </div>
        </Link>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className="group/like absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover/item:opacity-100 
                   transition-all duration-200 hover:bg-black/50"
      >
        <div className="relative">
          <HeartIconSolid 
            className={`w-5 h-5 absolute inset-0 text-red-500 transition-transform duration-200 ease-out
                       ${isLiked ? 'scale-100' : 'scale-0 group-hover/like:scale-100'}`}
          />
          <HeartIcon 
            className={`w-5 h-5 text-white transition-transform duration-200 ease-out
                       ${isLiked ? 'scale-0' : 'scale-100 group-hover/like:scale-0'}`}
          />
        </div>
      </button>
    </div>
  );
}
