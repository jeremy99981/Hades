'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const PULL_THRESHOLD = 100; // Distance minimale pour déclencher le rafraîchissement

export default function PullToRefresh() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const pullDistance = useMotionValue(0);
  const controls = useAnimation();

  // Transformer la distance de glissement en rotation pour l'icône
  const rotate = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 360]);
  
  // Transformer la distance en opacité
  const opacity = useTransform(
    pullDistance,
    [0, PULL_THRESHOLD * 0.3, PULL_THRESHOLD],
    [0, 0.5, 1]
  );

  // Gérer le début du glissement
  const handleTouchStart = (e: TouchEvent) => {
    // Ne déclencher que si on est en haut de la page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  // Gérer le glissement
  const handleTouchMove = (e: TouchEvent) => {
    if (startY === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    // Ne permettre que le glissement vers le bas quand on est en haut
    if (window.scrollY === 0 && diff > 0) {
      e.preventDefault();
      // Ajouter une résistance au glissement
      const resistance = 0.4;
      pullDistance.set(diff * resistance);
    }
  };

  // Gérer la fin du glissement
  const handleTouchEnd = async () => {
    if (pullDistance.get() >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      
      // Animation de l'indicateur pendant le rafraîchissement
      controls.start({
        rotate: 360,
        transition: { duration: 1, repeat: Infinity, ease: "linear" }
      });

      // Rafraîchir la page
      router.refresh();
      
      // Réinitialiser après un court délai
      setTimeout(() => {
        setIsRefreshing(false);
        pullDistance.set(0);
        controls.stop();
      }, 1000);
    } else {
      // Animation de retour si le seuil n'est pas atteint
      pullDistance.set(0);
    }
    setStartY(0);
  };

  useEffect(() => {
    // Ajouter les écouteurs d'événements tactiles
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, isRefreshing]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: pullDistance,
        opacity,
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        style={{
          rotate,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '50%',
          padding: '12px',
        }}
        animate={controls}
      >
        <ArrowPathIcon className="h-6 w-6 text-white" />
      </motion.div>
    </motion.div>
  );
}
