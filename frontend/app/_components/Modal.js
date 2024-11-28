'use client';

import { X } from 'lucide-react';
import { Button } from './shadcn/button';

export default function Modal({ isOpen, onClose, title, children, showCloseButton = true }) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg w-full max-w-md p-6 relative'>
        {showCloseButton && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-4 top-4'
            onClick={onClose}
          >
            <X className='h-4 w-4' />
          </Button>
        )}

        <h2 className='text-xl font-semibold mb-4'>{title}</h2>
        {children}
      </div>
    </div>
  );
}
