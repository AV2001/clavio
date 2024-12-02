import axiosInstance from './axiosInstance';

export async function createOrganization(organization) {
  try {
    const response = await axiosInstance.post('/organizations/', organization);
    return response.data;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error(error.response.error);
  }
}
