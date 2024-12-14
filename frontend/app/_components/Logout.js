'use client';

import { LogOut } from 'lucide-react';
import ButtonIcon from './ButtonIcon';
import { signOutAction } from '@/app/_actions/authActions';

export default function Logout() {
  async function handleLogout() {
    try {
      await signOutAction();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  return (
    <ButtonIcon onClick={handleLogout}>
      <LogOut />
    </ButtonIcon>
  );
}
