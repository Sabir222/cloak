'use client';

import useSWR from 'swr';
import type { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUser() {
  const { data, isLoading, error } = useSWR<User>('/api/user', fetcher);
  return {
    user: data ?? null,
    isLoading,
    error
  };
}
