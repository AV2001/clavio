'use client';

import { useState } from 'react';
import { Button } from '@/app/_components/shadcn/button';
import { Input } from '@/app/_components/shadcn/input';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrganizationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [organizationName, setOrganizationName] = useState('');

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    try {
      // Call your API to create organization
      setOrganizationName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  return (
    <div className='relative'>
      <Button
        variant='ghost'
        className='w-full justify-between'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Organizations</span>
        {isOpen ? (
          <ChevronUp className='h-4 w-4' />
        ) : (
          <ChevronDown className='h-4 w-4' />
        )}
      </Button>

      {isOpen && (
        <div className='absolute top-full left-0 w-64 mt-2 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-50'>
          {!showCreateForm ? (
            <Button
              variant='ghost'
              className='w-full justify-start text-sm'
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className='h-4 w-4 mr-2' />
              Create Organization
            </Button>
          ) : (
            <form onSubmit={handleCreateOrganization} className='space-y-2'>
              <Input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder='Organization name'
                className='text-sm'
              />
              <div className='flex gap-2'>
                <Button type='submit' size='sm' className='flex-1'>
                  Create
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setShowCreateForm(false)}
                  className='flex-1'
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
