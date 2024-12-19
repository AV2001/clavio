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

      if (!confirmed) {
        throw new Error('Operation cancelled');
      }

      return await deleteTeamMemberAction(userId);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { deleteTeamMember, isDeleting };
}
