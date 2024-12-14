'use server';

import { signIn, signOut, globalAuthorizeError } from '@/auth';
import axiosInstance from '@/app/api/axiosInstance';

export async function signUpAction(formData) {
  try {
    const response = await axiosInstance.post('/users/', {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password'),
      isInvite: formData.get('isInvite'),
      organizationName: formData.get('organizationName'),
      inviteToken: formData.get('inviteToken'),
    });

    const { success, message } = response.data;
    return { success, message };
  } catch (error) {
    return {
      success: error.response?.data?.success,
      message:
        error.response?.data?.message ||
        "There's an error creating your account. Please try again later.",
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
    // Access the error from global variable
    const success = globalAuthorizeError?.response?.data?.success;
    const message =
      globalAuthorizeError?.response?.data?.message ||
      "There's an error logging you in. Please try again later.";

    return {
      success,
      message,
    };
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
