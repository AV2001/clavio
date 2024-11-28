'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createChatbot, deleteChatbot } from '@/app/_api/chatbotApi';

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
