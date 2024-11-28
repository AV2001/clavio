import '@/app/_styles/globals.css';
import { Inter } from 'next/font/google';

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

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
