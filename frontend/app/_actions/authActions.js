'use server';

import { signIn } from '@/auth';
import { createUser } from '@/app/_api/userApi';
import { redirect } from 'next/navigation';

export async function signUpAction(formData) {
  try {
    // Create the user first
    await createUser({
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
  } catch (error) {
    throw new Error(error);
  }
}

export async function loginAction(formData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message);
  }
}

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
