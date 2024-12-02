import { auth } from './auth';
export const middleware = auth;

export const config = {
  matcher: ['/dashboard', '/chatbots/:path*', '/settings'],
};
