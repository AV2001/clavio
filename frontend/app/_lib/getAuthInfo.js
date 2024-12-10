import { auth } from '@/auth';

export async function getAuthInfo() {
  return await auth();
}
