import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';
import axiosInstance from '@/app/api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

// Global variable to store authorize error
export let globalAuthorizeError = null;

async function refreshAccessToken(token) {
  console.log('Attempting to refresh token'); // Add logging

  console.log('👇👇👇👇👇');
  console.log(token);
  console.log('👆👆👆👆👆');

  if (!token?.refreshToken) {
    console.error('No refresh token available');
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }

  try {
    const response = await axiosInstance.post(
      `/auth/token/refresh/`,
      { refresh: token.refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: null,
      }
    );

    if (response.status !== 200) {
      throw new Error(response.data?.error || 'Failed to refresh token');
    }

    return {
      ...token,
      accessToken: response.data.access,
      refreshToken: response.data.refresh,
      error: undefined,
    };
  } catch (error) {
    console.error(
      'Error refreshing token:',
      error?.response?.data || error.message
    );
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  // trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = credentials;
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,
            { email, password }
          );

          if (!response.data) return null;

          // Remove the data wrapper here
          const {
            user,
            email: userEmail,
            fullName,
            isAdmin,
            tokens,
          } = response.data.data;

          return {
            id: user,
            email: userEmail,
            fullName: fullName,
            isAdmin: isAdmin,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          };
        } catch (error) {
          globalAuthorizeError = error;
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            isAdmin: user.isAdmin,
          },
        };
      }

      // Check if the token is expired
      try {
        const decodedToken = jwtDecode(token.accessToken);
        const isExpired = Date.now() >= decodedToken.exp * 1000;

        console.log('Token Expiration Check:', {
          currentTime: Date.now(),
          tokenExpiration: decodedToken.exp * 1000,
          isExpired,
        });

        // If token is not expired, return the current token
        if (!isExpired) {
          return token;
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
      }

      // Access token has expired, try to refresh it
      try {
        const refreshedToken = await refreshAccessToken(token);

        if (refreshedToken.error) {
          throw new Error('Failed to refresh token');
        }

        return refreshedToken;
      } catch (error) {
        console.error('Error in token refresh process:', error);

        // On error, sign out the user
        await signOut();
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },

    async session({ session, token }) {
      if (token.error) {
        return null;
      }

      session.user = token.user;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;

      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
});
