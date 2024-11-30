'use client';

import { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

const VideoModal = dynamic(() => import('./VideoModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center">
      <div className="w-full max-w-4xl h-64 bg-gray-900 rounded-lg animate-pulse" />
    </div>
  ),
});

interface ClientTrailerButtonProps {
  trailerKey?: string;
  title: string;
  year?: string;
}

export default function ClientTrailerButton({ trailerKey, title, year }: ClientTrailerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => trailerKey && setIsModalOpen(true)}
        disabled={!trailerKey}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
          trailerKey 
            ? 'bg-white text-black hover:bg-white/90' 
            : 'bg-white/10 text-white/50 cursor-not-allowed'
        }`}
      >
        <PlayIcon className="w-6 h-6" />
        {trailerKey ? 'Bande annonce' : 'Bande annonce non disponible'}
      </button>

      {isModalOpen && trailerKey && (
        <VideoModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          videoKey={trailerKey}
        />
      )}
    </>
  );
}
