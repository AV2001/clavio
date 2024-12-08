'use server';

import axiosInstance from '@/app/api/axiosInstance';

export async function inviteTeamMemberAction(email) {
  try {
    const response = await axiosInstance.post('/users/invite/', { email });
    const { success, message } = response.data;
    return { success, message };
  } catch (error) {
    throw new Error(
      error.response?.data?.message ??
        'Unable to invite team member. Please try again later.'
    );
  }
}

export async function deleteTeamMemberAction(userId) {
  try {
    const response = await axiosInstance.delete(`/users/${userId}/`);
    const { success, message } = response.data;
    return { success, message };
  } catch (error) {
    throw new Error(
      error.response?.data?.message ??
        'Unable to delete team member. Please try again later.'
    );
  }
}
