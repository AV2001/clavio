import axiosInstance from './axiosInstance';

// Use only during initial sign-in (no auth required)
export async function checkUserExists({ email }) {
  try {
    const response = await axiosInstance.get(`/users/exists/?email=${email}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: null };
    }
    // console.error('Error checking user:', error);
    throw error;
  }
}

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
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again.';
    throw new Error(errorMessage);
  }
}
