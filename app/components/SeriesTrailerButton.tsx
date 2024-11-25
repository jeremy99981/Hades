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

interface SeriesTrailerButtonProps {
  trailerKey: string;
}

export default function SeriesTrailerButton({ trailerKey }: SeriesTrailerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
      >
        <PlayIcon className="w-6 h-6" />
        Voir la bande annonce
      </button>

      {isModalOpen && (
        <VideoModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          videoKey={trailerKey}
        />
      )}
    </>
  );
}
