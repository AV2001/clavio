import ChatbotList from './ChatbotList';
import Link from 'next/link';
import Heading from '@/app/_components/Heading';
import { getChatbots } from '@/app/api/chatbotApi';
import { auth } from '@/auth';

export const metadata = {
  title: 'My Chatbots',
};

export default async function MyChatbots() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;
  const chatbots = await getChatbots();

  return (
    <>
      <Heading>My Chatbots</Heading>
      {chatbots.length > 0 ? (
        <ChatbotList chatbots={chatbots} />
      ) : isAdmin ? (
        <p>
          You have not created any chatbots yet. Please do so{' '}
          <Link href='/chatbots/create' className='underline'>
            here
          </Link>
          .
        </p>
      ) : (
        <p>Your organization does not have any chatbots yet.</p>
      )}
    </>
  );
}
