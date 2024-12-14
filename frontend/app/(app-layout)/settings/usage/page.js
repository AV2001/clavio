import Heading from '@/app/_components/Heading';

export const metadata = {
  title: 'Usage Settings',
};

export default async function UsageSettings() {
  return (
    <div className='space-y-4'>
      <Heading>Usage Overview</Heading>
      <p className='text-muted-foreground'>
        Your usage information will appear here.
      </p>
    </div>
  );
}
