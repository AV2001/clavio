import { auth } from './auth';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const session = await auth();

  // If user is not authenticated, redirect to login page
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/chatbots/:path*', '/settings'],
};
