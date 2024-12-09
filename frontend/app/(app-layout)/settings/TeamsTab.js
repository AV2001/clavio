'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import MiniLoader from '@/app/_components/MiniLoader';
import { useGetUsers } from '@/app/_hooks/useGetUsers';
import { Input } from '@/app/_components/shadcn/input';
import { Search, Trash2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/app/_components/shadcn/table';
import { useInviteTeamMember } from '@/app/_hooks/useInviteTeamMember';
import { useDeleteTeamMember } from '@/app/_hooks/useDeleteTeamMember';

export default function TeamsTab() {
  const [email, setEmail] = useState('');
  const { users, isLoadingUsers, error } = useGetUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const { inviteTeamMember, isInviting } = useInviteTeamMember();
  const { deleteTeamMember, isDeleting } = useDeleteTeamMember();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  async function handleInvite() {
    inviteTeamMember(email, {
      onSuccess: () => {
        setEmail('');
      },
    });
  }

  // Sort users to show admins first
  const sortedUsers = users?.sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    return 0;
  });

  // Filter users based on search query
  const filteredUsers = sortedUsers?.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  function getRoleDisplay(user) {
    if (!user.acceptedInvite) {
      return {
        text: 'Pending...',
        className: 'bg-yellow-100 text-yellow-800',
      };
    }
    return user.isAdmin
      ? {
          text: 'Admin',
          className: 'bg-blue-100 text-blue-800',
        }
      : {
          text: 'Member',
          className: 'bg-gray-100 text-gray-800',
        };
  }

  return (
    <div className='space-y-10'>
      <div className='bg-white rounded-xl p-6 shadow-sm w-1/2'>
        <h2 className='text-xl font-semibold mb-4'>Invite member</h2>
        <div className='flex gap-3'>
          <Input
            type='email'
            value={email}
            onChange={handleEmailChange}
            placeholder='Email address'
            className='flex-1'
            disabled={isInviting}
          />
          <button
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              email
                ? 'bg-primary-800 text-primary-50 hover:bg-primary-900'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            disabled={!email}
            onClick={handleInvite}
          >
            {isInviting ? <MiniLoader /> : 'Invite'}
          </button>
        </div>
      </div>

      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-xl font-semibold mb-4'>Members</h2>
        <div className='relative mb-6'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            type='text'
            placeholder='Search by name or email...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='bg-white rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className='w-[50px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-8'>
                    <MiniLoader className='border-primary-800' />
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center text-gray-500'>
                    {searchQuery
                      ? 'No members found matching your search.'
                      : 'No members found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => {
                  const roleDisplay = getRoleDisplay(user);

                  return (
                    <TableRow key={user.id} className='hover:bg-gray-50'>
                      <TableCell className='font-medium'>
                        {user?.fullName
                          ? user.fullName
                              .split(' ')
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(' ')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleDisplay.className}`}
                        >
                          {roleDisplay.text}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'MMM do, yyyy')}
                      </TableCell>
                      <TableCell>
                        {!user.isAdmin && (
                          <Trash2
                            className='h-4 w-4
                          s text-red-600 hover:text-red-800 cursor-pointer'
                            onClick={() => deleteTeamMember(user.id)}
                            disabled={isDeleting}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
