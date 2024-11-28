import ChatbotStatus from '../ChatbotStatus';
import Heading from '@/app/_components/Heading';
import { getChatbot } from '@/app/_api/chatbotApi';
import { Bot, Settings, BarChart2, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/app/_components/shadcn/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/_components/shadcn/tooltip';
import CopyEmbedButton from './CopyEmbedButton';
import DeleteChatbot from './DeleteChatbot';
import ChatbotTraining from '../ChatbotTraining';

export default async function ChatbotPage({ params }) {
  const { chatbotId } = params;
  const chatbot = await getChatbot(chatbotId);

  return (
    <>
      {chatbot.status === 'training' ? (
        <ChatbotTraining message={chatbot.trainingMessage} />
      ) : (
        <>
          {/* Header Section */}
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <div>
                <Heading>Chatbot Overview</Heading>
                <p className='text-gray-600'>
                  Manage and view details of your chatbot. Use the actions below
                  to update settings or view performance.
                </p>
              </div>
              <div className='flex gap-3'>
                <CopyEmbedButton embedCode={chatbot.embedCode} />
                <DeleteChatbot chatbotId={chatbotId} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className='flex gap-4'>
              <Button variant='outline' className='flex items-center gap-2'>
                <Settings className='w-4 h-4' />
                Edit Settings
              </Button>
              <Button variant='outline' className='flex items-center gap-2'>
                <BarChart2 className='w-4 h-4' />
                View Analytics
              </Button>
              <Button variant='outline' className='flex items-center gap-2'>
                <RefreshCw className='w-4 h-4' />
                Retrain Bot
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Basic Information Card */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold'>Basic Information</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className='w-5 h-5 text-gray-400' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Basic details about your chatbot</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center'
                    style={{
                      backgroundColor: chatbot.primaryColor || '#000000',
                    }}
                  >
                    <Bot className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='font-medium text-lg'>{chatbot.name}</h3>
                    <p className='text-sm text-gray-500'>ID: {chatbotId}</p>
                  </div>
                </div>

                <div className='pt-4 border-t'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Status</span>
                    <ChatbotStatus
                      chatbotId={chatbot.id}
                      initialStatus={chatbot.status}
                    />
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Created</span>
                    <span>
                      {new Date(chatbot.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Organization</span>
                    <span>{chatbot.organization}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Card */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold'>Configuration</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className='w-5 h-5 text-gray-400' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current configuration settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Initial Message</span>
                  <span className='text-gray-900'>
                    {chatbot.initialMessage}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Primary Color</span>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-6 h-6 rounded border'
                      style={{ backgroundColor: chatbot.primaryColor }}
                    />
                    <span>{chatbot.primaryColor}</span>
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Font Size</span>
                  <span>{chatbot.fontSize}px</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Border Radius</span>
                  <span>{chatbot.chatbotBorderRadius}px</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
