import Heading from '@/app/_components/Heading';
import TeamsTab from '../TeamsTab';

export const metadata = {
  title: 'Team Settings',
};

export default async function TeamSettings() {
  return (
    <div className='space-y-4'>
      <Heading level={2}>Team Management</Heading>
      <TeamsTab />
    </div>
  );
}
