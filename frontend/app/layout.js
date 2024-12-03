import '@/app/_styles/globals.css';
import { Inter } from 'next/font/google';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import ToastProvider from '@/app/_utils/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Clavio',
  description:
    'Build customizable AI-powered chatbots within minutes with Clavio. Create customer-facing or internal chatbots using your own data.',
  icons: {
    icon: '/icon.png',
  },
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang='en'>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
