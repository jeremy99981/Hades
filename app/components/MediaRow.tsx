'use client';

import { useRef, useState, useEffect } from 'react';

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

    const scrollAmount = container.clientWidth - 100;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
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
      checkArrows();
      window.addEventListener('load', checkArrows);
      window.addEventListener('resize', checkArrows);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkArrows);
        window.removeEventListener('load', checkArrows);
        window.removeEventListener('resize', checkArrows);
      }
    };
  }, []);

  return (
    <section className="w-full relative px-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => scroll('left')}
            className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
              !showLeftArrow && 'opacity-50 cursor-not-allowed hover:bg-white/10'
            }`}
            disabled={!showLeftArrow}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
              !showRightArrow && 'opacity-50 cursor-not-allowed hover:bg-white/10'
            }`}
            disabled={!showRightArrow}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
      >
        {children}
      </div>
    </section>
  );
};

export default MediaRow;
