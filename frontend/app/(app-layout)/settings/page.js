import UsageTab from './UsageTab';

export const metadata = {
  title: 'Settings',
};

export default function Settings() {
  return (
    <div className='mt-6'>
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Usage Overview</h2>
        <UsageTab />
      </div>
    </div>
  );
}
