'use client';

import { ReactNode } from 'react';
import { AuthProvider as AuthHookProvider } from '../hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { Provider, value, children: hookChildren } = AuthHookProvider({ children });

  return (
    <Provider value={value}>
      {hookChildren}
    </Provider>
  );
}
