'use client';

import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="fixed top-16 left-8 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-200"
    >
      <ChevronLeftIcon className="w-6 h-6 text-white" />
    </button>
  );
}
