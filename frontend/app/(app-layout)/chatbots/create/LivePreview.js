import { useMemo, useState } from 'react';
import { Input } from '@/app/_components/shadcn/input';
import { Button } from '@/app/_components/shadcn/button';
import Heading from '@/app/_components/Heading';
import { User, Bot, Send, X } from 'lucide-react';

export default function LivePreview({
  chatbotName,
  initialMessage,
  primaryColor,
  secondaryColor,
  chatbotBorderRadius,
  fontSize,
  botImage,
  widgetColor,
  widgetBorderRadius,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultbotImage = useMemo(
    () => (
      <div
        className='w-8 h-8 rounded-full flex items-center justify-center'
        style={{ backgroundColor: primaryColor }}
      >
        <Bot className='w-5 h-5 text-white' />
      </div>
    ),
    [primaryColor]
  );

  return (
    <div className='flex flex-col items-center fixed bottom-8 right-8'>
      <Heading level={2} className='mb-2'>
        Live Preview
      </Heading>

      {isOpen ? (
        <div
          className='w-[350px] h-[500px] rounded-lg flex flex-col bg-white shadow-lg'
          style={{
            fontSize: `${fontSize}px`,
            borderRadius: `${chatbotBorderRadius}px`,
          }}
        >
          {/* Chat Header */}
          <div
            className='p-4 flex items-center justify-between border-b'
            style={{
              backgroundColor: primaryColor,
              borderTopLeftRadius: `${chatbotBorderRadius}px`,
              borderTopRightRadius: `${chatbotBorderRadius}px`,
            }}
          >
            <div className='flex items-center gap-3'>
              {botImage ? (
                <img
                  src={botImage}
                  alt={chatbotName}
                  className='w-8 h-8 rounded-full object-cover'
                />
              ) : (
                defaultbotImage
              )}
              <span className='font-medium' style={{ color: secondaryColor }}>
                {chatbotName || 'AI Assistant'}
              </span>
            </div>
            <Button
              size='icon'
              variant='ghost'
              className='hover:bg-transparent'
              onClick={() => setIsOpen(false)}
            >
              <X className='w-5 h-5' style={{ color: secondaryColor }} />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className='flex-1 p-4 overflow-y-auto space-y-4'>
            {/* Bot Message */}
            <div className='flex items-start gap-2'>
              {botImage ? (
                <img
                  src={botImage}
                  alt={chatbotName}
                  className='w-10 h-10 rounded-full object-cover'
                />
              ) : (
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center'
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bot className='w-6 h-6 text-white' />
                </div>
              )}
              <div
                className='p-3 max-w-[80%]'
                style={{
                  backgroundColor: `${primaryColor}20`,
                  borderRadius: `${chatbotBorderRadius}px`,
                }}
              >
                <p>{initialMessage || 'Welcome! How can I help you today?'}</p>
              </div>
            </div>

            {/* User Message Example */}
            <div className='flex items-start gap-2 justify-end'>
              <div
                className='p-3 max-w-[80%]'
                style={{
                  backgroundColor: primaryColor,
                  color: secondaryColor,
                  borderRadius: `${chatbotBorderRadius}px`,
                }}
              >
                <p>Hi! I have a question.</p>
              </div>
              <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
                <User className='w-6 h-6 text-gray-600' />
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className='p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Type a message...'
                className='flex-1'
                style={{ borderRadius: `${chatbotBorderRadius}px` }}
              />
              <Button
                size='icon'
                style={{
                  backgroundColor: primaryColor,
                  color: secondaryColor,
                  borderRadius: `${chatbotBorderRadius}px`,
                }}
              >
                <Send className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Widget Button */
        <Button
          size='icon'
          className='w-14 h-14'
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: widgetColor || primaryColor,
            borderRadius: `${widgetBorderRadius || chatbotBorderRadius}px`,
          }}
        >
          <Bot className='w-6 h-6 text-white' />
        </Button>
      )}
    </div>
  );
}
