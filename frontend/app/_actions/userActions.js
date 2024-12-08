'use server';

import axiosInstance from '@/app/api/axiosInstance';

export async function getUsers() {
  try {
    const response = await axiosInstance.get('/users/');
    const { users } = response.data;
    return users;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ??
        'Unable to connect to the server. Please try again later.'
    );
  }
}
