'use client';

import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import WordFadeIn from '@/app/_components/shadcn/word-fade-in';
import PricingCard from '@/app/_components/PricingCard';

export default function PricingSection() {
  const pricingRef = useRef(null);
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.2 });
  const [chatbotType, setChatbotType] = useState('internal');
  const [tokenCount, setTokenCount] = useState('');

  const customerFacingContent = (
    <div className='text-center'>
      <p className='text-lg mb-8'>
        Calculate your cost based on how many messages your customers exchange with your chatbot. Each message sent or received counts as one message.
      </p>
      
      <div className='max-w-md mx-auto'>
        <div className='mb-4'>
          <input
            type='number'
            value={tokenCount}
            onChange={(e) => setTokenCount(e.target.value)}
            placeholder='Enter message count'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
          />
        </div>

        <div className='flex justify-center gap-4 mb-6'>
          {[10000, 100000, 1000000].map((preset) => (
            <button
              key={preset}
              onClick={() => setTokenCount(preset)}
              className='px-4 py-2 text-sm border border-black rounded-lg hover:bg-gray-50'
            >
              {preset.toLocaleString()} messages
            </button>
          ))}
        </div>

        {tokenCount && (
          <div className='mt-8 p-6 bg-gray-50 rounded-lg'>
            <p className='text-lg mb-2'>Estimated Price</p>
            <p className='text-3xl font-bold'>
              ${(Number(tokenCount) * 0.0012).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
            <p className='text-sm text-gray-600 mt-2'>
              Based on {Number(tokenCount).toLocaleString()} messages
            </p>
          </div>
        )}

        <button className='mt-8 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800'>
          Buy
        </button>
      </div>
    </div>
  );

  return (
    <section id='pricing' className='py-20' ref={pricingRef}>
      <div className='container'>
        {pricingInView && (
          <>
            <WordFadeIn
              words="Simple, Transparent Pricing"
              className="font-bold text-center mb-6"
            />
            
            <div className='flex justify-center gap-4 mb-12'>
              <button
                onClick={() => setChatbotType('internal')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  chatbotType === 'internal' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border border-black hover:bg-gray-50'
                }`}
              >
                Internal Chatbots
              </button>
              <button
                onClick={() => setChatbotType('customer-facing')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  chatbotType === 'customer-facing' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border border-black hover:bg-gray-50'
                }`}
              >
                Customer-Facing Chatbots
              </button>
            </div>
          </>
        )}

        {pricingInView && chatbotType === 'internal' ? (
          <div className='grid gap-8 md:grid-cols-3'>
            <PricingCard
              title='Hobby'
              price={9.99}
              features={[
                '1 Chatbot',
                '3 PDFs',
                '10 Pages per PDF',
                '5 URL Links',
                '20 Prompts per day',
                '1-10 Users',
              ]}
              cta='Get Started'
            />
            <PricingCard
              title='Startup'
              price={13.99}
              features={[
                '3 Chatbots',
                '10 PDFs',
                '30 Pages per PDF',
                '20 URL Links',
                '50 Prompts per day',
                '10-50 Users',
                '2 Retrains per month'
              ]}
              cta='Upgrade to Startup'
            />
            <PricingCard
              title='Enterprise'
              price={19.99}
              features={[
                '5 Chatbots',
                '20 PDFs',
                '100 Pages per PDF', 
                '50 URL Links',
                '100 Prompts per day',
                'Unlimited Users',
                '3 Retrains per month'
              ]}
              cta='Contact Sales'
            />
          </div>
        ) : pricingInView && (
          customerFacingContent
        )}
      </div>
    </section>
  );
}
