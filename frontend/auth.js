import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = credentials;

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,
            {
              email,
              password,
            }
          );

          const userData = response.data;

          if (!userData) {
            return null;
          }

          // Return the data in a structure that NextAuth expects
          return {
            id: userData.user,
            email: userData.email,
            fullName: userData.fullName,
            isAdmin: userData.isAdmin,
            accessToken: userData.tokens.access,
            refreshToken: userData.tokens.refresh,
            csrfToken: userData.tokens.csrf,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in - add user data to token
        token.id = user.id;
        token.email = user.email;
        token.fullName = user.fullName;
        token.isAdmin = user.isAdmin;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.csrfToken = user.csrfToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Add the custom data to the session
        session.user = {
          id: token.id,
          email: token.email,
          fullName: token.fullName,
          isAdmin: token.isAdmin,
        };
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.csrfToken = token.csrfToken;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
});
