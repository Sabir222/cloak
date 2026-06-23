'use client';

import { SWRConfig } from 'swr';

type SWRProviderProps = {
  children: React.ReactNode;
  fallback?: Record<string, unknown>;
};

export function SWRProvider({ children, fallback }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fallback,
        onError: (err) => {
          console.error('SWR error:', err);
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}
