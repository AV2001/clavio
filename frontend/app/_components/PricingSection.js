'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import WordFadeIn from '@/app/_components/shadcn/word-fade-in';
import PricingCard from '@/app/_components/PricingCard';

export default function PricingSection() {
  const pricingRef = useRef(null);
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.2 });

  return (
    <section id='pricing' className='py-20' ref={pricingRef}>
      <div className='container'>
        {pricingInView && (
          <WordFadeIn
            words="Simple, Transparent Pricing"
            className="text-3xl font-bold text-center mb-12"
          />
        )}
        <div className='grid gap-8 md:grid-cols-3'>
          <PricingCard
            title='Basic'
            price={29}
            features={[
              '1 Chatbot',
              '1,000 messages/month',
              'Basic customization',
              'Email support',
            ]}
            cta='Get Started'
          />
          <PricingCard
            title='Pro'
            price={79}
            features={[
              '3 Chatbots',
              '10,000 messages/month',
              'Advanced customization',
              'Priority support',
            ]}
            cta='Upgrade to Pro'
          />
          <PricingCard
            title='Enterprise'
            price={199}
            features={[
              'Unlimited Chatbots',
              'Unlimited messages',
              'Full customization',
              '24/7 dedicated support',
            ]}
            cta='Contact Sales'
          />
        </div>
      </div>
    </section>
  );
}
