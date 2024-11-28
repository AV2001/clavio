'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/app/_components/shadcn/button';
import { deleteChatbotAction } from '@/app/_actions/chatbotActions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ chatbotId }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this chatbot? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        const result = await deleteChatbotAction(chatbotId);
        if (result.success) {
          router.replace('/chatbots');
          toast.success('Chatbot deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting chatbot:', error);
        toast.error(error.message);
      }
    }
  };

  return (
    <Button
      variant='destructive'
      className='flex items-center gap-2 hover:bg-red-700 bg-red-600 text-white'
      onClick={handleDelete}
    >
      <Trash2 className='w-4 h-4' />
      Delete
    </Button>
  );
}
