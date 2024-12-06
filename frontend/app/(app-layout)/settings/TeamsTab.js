'use client';

import { useState } from 'react';
import { inviteTeamMemberAction } from '@/app/_actions/teamActions';
import { toast } from 'react-toastify';
import Loader from '@/app/_components/Loader';
import { useGetUsers } from '@/app/_hooks/useGetUsers';

export default function TeamsTab() {
  const [email, setEmail] = useState('');
  const { users, isLoadingUsers } = useGetUsers();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  async function handleInvite() {
    const result = await inviteTeamMemberAction(email);
    if (result.success) {
      toast.success(result.message);
      setEmail('');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className='space-y-8'>
      <div className='bg-background rounded-lg border border-border p-6'>
        <h2 className='text-xl font-semibold mb-6'>Invite member</h2>
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Email address
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={handleEmailChange}
              className='w-full bg-background border border-border rounded-md px-4 py-2 text-foreground'
              placeholder='steve.wozniak@example.com'
            />
          </div>
          <div>
            <button
              className={`px-4 py-2 rounded-md ${
                email
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              disabled={!email}
              onClick={handleInvite}
            >
              Invite
            </button>
          </div>
        </div>
      </div>

      <div className='bg-background rounded-lg border border-border p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold'>Members</h2>
        </div>
        {isLoadingUsers ? (
          <div className='flex justify-center py-8'>
            <Loader />
          </div>
        ) : (
          <div className='space-y-4'>
            {users?.map((user) => (
              <div
                key={user.email}
                className='flex items-center justify-between py-3'
              >
                <div>
                  <p className='text-foreground font-medium'>{user.fullName}</p>
                  <p className='text-sm text-muted-foreground'>{user.email}</p>
                  <p className='text-sm text-muted-foreground'>
                    Joined on {new Date(user.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <span
                    className={`text-sm px-3 py-1 rounded ${
                      user.isAdmin
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary/10 text-secondary-foreground'
                    }`}
                  >
                    {user.isAdmin ? 'Admin' : 'Member'}
                  </span>
                  <button className='text-sm text-destructive hover:text-destructive/80'>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-background rounded-lg border border-border p-6'>
        <h2 className='text-xl font-semibold mb-4'>Delete Team</h2>
        <p className='text-muted-foreground mb-4'>
          Permanently delete the team and all of its contents from Resend.
        </p>
        <button className='px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md'>
          Delete Team
        </button>
      </div>
    </div>
  );
}
