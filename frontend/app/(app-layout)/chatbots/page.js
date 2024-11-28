import ChatbotList from './ChatbotList';
import Link from 'next/link';
import Heading from '@/app/_components/Heading';
import { getChatbots } from '@/app/_api/chatbotApi';

export const metadata = {
  title: 'My Chatbots',
};

export default async function MyChatbots() {
  const chatbots = await getChatbots();

  return (
    <>
      <Heading>My Chatbots</Heading>
      {chatbots.length > 0 ? (
        <ChatbotList chatbots={chatbots} />
      ) : (
        <p>
          You have not created any chatbots yet. Please do so{' '}
          <Link href='/chatbots/create' className='underline'>
            here
          </Link>
          .
        </p>
      )}
    </>
  );
}
