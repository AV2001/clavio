import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SettingsHeader from './SettingsHeader';

export default async function SettingsLayout({ children }) {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  if (!isAdmin) {
    redirect('/chatbots');
  }

  return (
    <div className='space-y-6'>
      <SettingsHeader />
      {children}
    </div>
  );
}
