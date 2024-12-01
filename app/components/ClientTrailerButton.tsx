'use client';

import { useState } from 'react';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
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

  const handleClick = () => trailerKey && setIsModalOpen(true);

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!trailerKey}
        className={`h-12 inline-flex items-center space-x-2 px-6 rounded-full
                   bg-white/10 hover:bg-white/15 backdrop-blur-md
                   transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   group relative overflow-hidden`}
      >
        <div className="relative z-10 flex items-center space-x-2">
          <PlayCircleIcon className="w-5 h-5 text-white" />
          <span className="text-sm font-medium text-white">
            {trailerKey ? 'Bande annonce' : 'Bande annonce non disponible'}
          </span>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
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
