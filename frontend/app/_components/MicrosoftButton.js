'use client';

import { Button } from '@/app/_components/shadcn/button';
import { signInWithMicrosoftAction } from '@/app/_actions/authActions';

export default function MicrosoftButton() {
  return (
    <Button
      variant='outline'
      className='w-full border-gray-200 hover:bg-gray-100 flex items-center justify-start px-4'
      onClick={() => signInWithMicrosoftAction()}
    >
      <img src='/microsoft.svg' alt='Microsoft Icon' className='w-6 h-6 mr-2' />
      Continue with Microsoft Account
    </Button>
  );
}
