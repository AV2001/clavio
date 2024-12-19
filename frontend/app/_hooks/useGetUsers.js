'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/app/_actions/userActions';

export function useGetUsers() {
  const {
    data: users,
    isLoading: isLoadingUsers,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => await getUsers(),
    retry: 2,
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { users, isLoadingUsers, error };
}
