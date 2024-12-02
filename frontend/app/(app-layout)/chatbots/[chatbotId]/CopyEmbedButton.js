'use client';

import { useState } from 'react';
import { Button } from '@/app/_components/shadcn/button';
import { Code, Check, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function CopyEmbedButton({ embedCode, chatbotType, chatbotId }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleAction = async () => {
    if (chatbotType === 'internal') {
      router.push(`/chatbots/${chatbotId}/chat`);
      return;
    }

    if (embedCode) {
      try {
        await navigator.clipboard.writeText(embedCode);
        setCopied(true);
        toast.success('Embed code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy embed code:', error);
        toast.error('Failed to copy embed code');
      }
    }
  };

  return (
    <Button
      className='flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white'
      onClick={handleAction}
    >
      {chatbotType === 'internal' ? (
        <>
          <MessageSquare className='w-4 h-4' />
          Open Chat
        </>
      ) : (
        <>
          {copied ? <Check className='w-4 h-4' /> : <Code className='w-4 h-4' />}
          {copied ? 'Copied!' : 'Copy Embed Code'}
        </>
      )}
    </Button>
  );
}
