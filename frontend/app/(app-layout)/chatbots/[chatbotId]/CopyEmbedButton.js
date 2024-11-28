'use client';

import { useState } from 'react';
import { Button } from '@/app/_components/shadcn/button';
import { Code, Check } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CopyEmbedButton({ embedCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmbedCode = async () => {
    if (embedCode) {
      try {
        await navigator.clipboard.writeText(embedCode);
        setCopied(true);

        toast.success('Embed code copied to clipboard!');

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        console.error('Failed to copy embed code:', error);
        toast.error('Failed to copy embed code');
      }
    }
  };

  return (
    <Button
      className='flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white'
      onClick={handleCopyEmbedCode}
    >
      {copied ? <Check className='w-4 h-4' /> : <Code className='w-4 h-4' />}
      {copied ? 'Copied!' : 'Copy Embed Code'}
    </Button>
  );
}
