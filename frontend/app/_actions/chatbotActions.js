'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createChatbot, deleteChatbot } from '@/app/api/chatbotApi';
import axiosInstance from '@/app/api/axiosInstance';

export async function createChatbotAction(formData) {
  const trainingMethod = formData.get('trainingMethod');

  const newFormData = new FormData();

  if (trainingMethod === 'files') {
    for (let [key, value] of formData.entries()) {
      if (key.includes('files')) {
        newFormData.append('files', value);
      } else {
        newFormData.append(key, value);
      }
    }
  } else if (trainingMethod === 'urls') {
    for (let [key, value] of formData.entries()) {
      if (key.includes('urls')) {
        newFormData.append('urls', value);
      } else {
        newFormData.append(key, value);
      }
    }
  }

  try {
    await createChatbot(newFormData);
    revalidatePath('/chatbots');
    redirect(`/chatbots`);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    throw error;
  }
}

export async function deleteChatbotAction(chatbotId) {
  await deleteChatbot(chatbotId);
  revalidatePath('/chatbots');
  return { success: true };
}

export async function getChatbotsAction() {
  try {
    const response = await axiosInstance.get('/chatbots/');
    const { chatbots } = response.data;
    return chatbots;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ??
        'Unable to fetch chatbots. Please try again later.'
    );
  }
}
