'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteTeamMemberAction } from '@/app/_actions/teamActions';
import { toast } from 'react-toastify';

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  const { mutate: inviteTeamMember, isPending: isInviting } = useMutation({
    mutationFn: async (email) => await inviteTeamMemberAction(email),
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { inviteTeamMember, isInviting };
}
