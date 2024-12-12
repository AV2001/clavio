import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Heading from '@/app/_components/Heading';

export const metadata = {
  title: 'Account Settings',
};

export default async function AccountSettings() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  if (!isAdmin) {
    redirect('/chatbots');
  }

  return (
    <div className='space-y-4'>
      <Heading>Account Settings</Heading>
      <p className='text-muted-foreground'>
        Your account settings will appear here.
      </p>
    </div>
  );
}
