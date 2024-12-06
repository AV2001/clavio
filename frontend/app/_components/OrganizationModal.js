'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { Input } from './shadcn/input';
import { Button } from './shadcn/button';
import { createOrganization } from '@/app/api/organizationApi';

export default function OrganizationModal({ isOpen }) {
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await createOrganization({ name: organizationName });
      router.refresh(); // Refresh the page to update the user's organization status
    } catch (error) {
      setError(error.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Empty function to prevent closing
      title='Create Organization'
      showCloseButton={false} // Hide the close button
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Input
            placeholder='Organization name'
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
          />
          {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
        </div>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
