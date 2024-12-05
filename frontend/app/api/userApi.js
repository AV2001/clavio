import axiosInstance from './axiosInstance';

// Used for authenticated requests
export async function getUser({ email }) {
  try {
    const response = await axiosInstance.get(`/users/get/?email=${email}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: null };
    }
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function createUser({ fullName, email, password }) {
  try {
    const response = await axiosInstance.post('/users/', {
      fullName,
      email,
      password,
    });
    const { success, message } = response.data;
    return { success, message };
  } catch (error) {
    const errorMessage =
      error.response.data.message ||
      'An error occurred while creating your account.';
    throw new Error(errorMessage);
  }
}
