import { auth } from '@/auth';
import ReactQueryProvider from '@/app/_utils/providers/ReactQueryProvider';
import ToastProvider from '@/app/_utils/providers/ToastProvider';
import Header from '@/app/_components/Header';
import Sidebar from '@/app/_components/Sidebar';
import { SessionProvider } from 'next-auth/react';

export default async function AppLayout({ children }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className='grid grid-cols-[14rem_1fr] grid-rows-[auto_1fr] min-h-screen'>
        <Header />
        <Sidebar />
        <ReactQueryProvider>
          <ToastProvider>
            <main className='p-8 rounded-lg bg-primary-100'>{children}</main>
          </ToastProvider>
          b
        </ReactQueryProvider>
      </div>
    </SessionProvider>
  );
}
