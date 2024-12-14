import Heading from '@/app/_components/Heading';

export const metadata = {
  title: 'Account Settings',
};

export default async function AccountSettings() {
  return (
    <div className='space-y-4'>
      <Heading>Account Settings</Heading>
      <p className='text-muted-foreground'>
        Your account settings will appear here.
      </p>
    </div>
  );
}
