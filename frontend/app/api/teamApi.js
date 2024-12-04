import axiosInstance from './axiosInstance';

export async function inviteTeamMember({ email }) {
  try {
    const response = await axiosInstance.post(`/users/invite/`, { email });
    const { success, message } = response.data;
    return { success, message };
  } catch (error) {
    const errorMessage =
      error.response.data.message ||
      'An error occurred while inviting the team member.';
    throw new Error(errorMessage);
  }
}
