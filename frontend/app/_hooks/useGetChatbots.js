'use client';

import { useQuery } from '@tanstack/react-query';
import { getChatbots } from '@/app/_actions/chatbotActions';

export function useGetChatbots({ initialData } = {}) {
  const {
    data: chatbots,
    isLoading: isLoadingChatbots,
    error,
  } = useQuery({
    queryKey: ['chatbots'],
    queryFn: async () => await getChatbots(),
    initialData,
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { chatbots, isLoadingChatbots, error };
}
