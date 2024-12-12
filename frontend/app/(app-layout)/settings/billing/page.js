import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Heading from '@/app/_components/Heading';

export const metadata = {
  title: 'Billing Settings',
};

export default async function BillingSettings() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  if (!isAdmin) {
    redirect('/chatbots');
  }

  return (
    <div className='space-y-4'>
      <Heading>Billing Information</Heading>
      <p className='text-muted-foreground'>
        Your billing information will appear here.
      </p>
    </div>
  );
}
