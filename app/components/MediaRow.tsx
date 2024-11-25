'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface MediaRowProps {
  title: string;
  children: React.ReactNode;
  itemWidth: number;
}

const MediaRow = ({ title, children, itemWidth }: MediaRowProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -itemWidth * 2 : itemWidth * 2;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const checkArrows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkArrows);
      // Check initially
      checkArrows();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkArrows);
      }
    };
  }, []);

  return (
    <section className="w-full relative group">
      <div className="px-8 mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-medium">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className={`p-1 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-sm transition-all duration-200 ${
              !showLeftArrow && 'opacity-50 cursor-not-allowed'
            }`}
            disabled={!showLeftArrow}
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`p-1 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-sm transition-all duration-200 ${
              !showRightArrow && 'opacity-50 cursor-not-allowed'
            }`}
            disabled={!showRightArrow}
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-scroll pl-8 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export default MediaRow;
