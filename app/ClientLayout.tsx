'use client';

import { ReactNode } from 'react';
import Navbar from './components/Navbar';
import { AuthProvider } from './providers/AuthProvider';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}
