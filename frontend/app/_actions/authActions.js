'use server';

import { signIn } from '@/auth';

export async function signInWithGoogleAction() {
  await signIn('google', {
    redirect: true,
    redirectTo: '/auth/callback',
  });
}

export async function signInWithMicrosoftAction() {
  await signIn('microsoft', {
    redirect: true,
    redirectTo: '/auth/callback',
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}
