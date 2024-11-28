import ReactQueryProvider from '@/app/_utils/providers/ReactQueryProvider';
import ToastProvider from '@/app/_utils/providers/ToastProvider';
import Header from '@/app/_components/Header';
import Sidebar from '@/app/_components/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className='grid grid-cols-[14rem_1fr] grid-rows-[auto_1fr] min-h-screen'>
      <Header />
      <Sidebar />
      <ReactQueryProvider>
        <ToastProvider>
          <main className='p-8 rounded-lg bg-primary-100'>{children}</main>
        </ToastProvider>
      </ReactQueryProvider>
    </div>
  );
}
