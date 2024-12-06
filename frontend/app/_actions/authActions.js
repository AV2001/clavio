'use server';

import { signIn } from '@/auth';
import { createUser } from '@/app/api/userApi';

export async function signUpAction(formData) {
  try {
    const result = await createUser({
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
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
