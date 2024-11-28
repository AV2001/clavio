'use client';

import { Button } from '@/app/_components/shadcn/button';
import { signInWithGoogleAction } from '@/app/_actions/authActions';

export default function GoogleButton() {
  return (
    <Button
      variant='outline'
      className='w-full border-gray-200 hover:bg-gray-100 flex items-center justify-start px-4'
      onClick={() => signInWithGoogleAction()}
    >
      <img src='/google.svg' alt='Google Icon' className='w-5 h-5 mr-2' />
      Continue with Google
    </Button>
  );
}
