'use client';

import { Button } from '@/app/_components/shadcn/button';

export default function Error({ error, reset }) {
  return (
    <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
      <h2 className='text-lg font-semibold text-red-800 mb-2'>
        Something went wrong!
      </h2>
      <p className='text-red-600 mb-4'>{error.message}</p>
      <Button
        onClick={reset}
        variant='outline'
        className='text-red-600 hover:text-red-700 border-red-200'
      >
        Try again
      </Button>
    </div>
  );
}
