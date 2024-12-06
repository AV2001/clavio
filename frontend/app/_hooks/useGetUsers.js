'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/app/api/userApi';

export function useGetUsers() {
  const {
    data: users,
    isLoading: isLoadingUsers,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
    select: (data) => data.users,
  });

  return { users, isLoadingUsers, error };
}
