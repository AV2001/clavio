'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTeamMemberAction } from '@/app/_actions/teamActions';
import { toast } from 'react-toastify';

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  const { mutate: deleteTeamMember, isPending: isDeleting } = useMutation({
    mutationFn: async (userId) => {
      const confirmed = window.confirm(
        'Are you sure you want to remove this team member? This action cannot be undone.'
      );

      if (confirmed) {
        return await deleteTeamMemberAction(userId);
      }

      return null;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { deleteTeamMember, isDeleting };
}
