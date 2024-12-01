'use client';

import dynamic from 'next/dynamic';

const PullToRefresh = dynamic(() => import('./PullToRefresh'), {
  ssr: false // Désactive le rendu côté serveur pour ce composant
});

export default function ClientPullToRefresh() {
  return <PullToRefresh />;
}
