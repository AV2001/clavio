import axiosInstance from './axiosInstance';

export async function getChatbots() {
  try {
    const response = await axiosInstance.get('/chatbots/');
    return response.data;
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    throw error.response.data;
  }
}

export async function getChatbot(chatbotId) {
  try {
    const response = await axiosInstance.get(`/chatbots/${chatbotId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    throw error.response.data;
  }
}

export async function createChatbot(data) {
  try {
    const response = await axiosInstance.post('/chatbots/', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error.response.data;
  }
}

export async function deleteChatbot(chatbotId) {
  try {
    const response = await axiosInstance.delete(`/chatbots/${chatbotId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    throw error.response.data;
  }
}
