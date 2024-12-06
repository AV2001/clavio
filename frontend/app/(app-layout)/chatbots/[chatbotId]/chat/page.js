import { getChatbot } from '@/app/api/chatbotApi';
import Heading from '@/app/_components/Heading';
import ChatInterface from './ChatInterface';

export const metadata = {
  title: 'Chat',
};

export default async function ChatPage({ params }) {
  const chatbot = await getChatbot(params.chatbotId);

  return (
    <div className='h-[calc(100vh-theme(spacing.32))]'>
      <Heading className='mb-4'>
        {chatbot.name
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </Heading>
      <div className='h-full bg-white rounded-lg border shadow-sm overflow-hidden'>
        <ChatInterface chatbot={chatbot} />
      </div>
    </div>
  );
}
