import Link from 'next/link';
import Heading from '@/app/_components/Heading';

export const metadata = {
  title: 'Dashboard',
};

export default function Dashboard() {
  return (
    <>
      <Heading>Dashboard</Heading>
      <div className='mt-8'>
        <p className='text-gray-600'>
          Welcome to your dashboard. Get started by{' '}
          <Link href='/chatbots/create' className='text-primary-600 underline'>
            creating a chatbot
          </Link>
          .
        </p>
      </div>
    </>
  );
}
