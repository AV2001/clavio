import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Heading from '@/app/_components/Heading';
import TeamsTab from '../TeamsTab';

export const metadata = {
  title: 'Team Settings',
};

export default async function TeamSettings() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  if (!isAdmin) {
    redirect('/chatbots');
  }

  return (
    <div className='space-y-4'>
      <Heading level={2}>Team Management</Heading>
      <TeamsTab />
    </div>
  );
}
