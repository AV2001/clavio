'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import WordFadeIn from '@/app/_components/shadcn/word-fade-in';
import { MessageSquare, FileText, Building2 } from 'lucide-react';

export default function FeaturesSection() {
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });

  return (
    <section id='features' className='py-20' ref={featuresRef}>
      <div className='container'>
        {featuresInView && (
          <WordFadeIn
            words="Key Features"
            className="text-3xl font-bold text-center mb-12"
          />
        )}
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          <FeatureCard
            icon={<MessageSquare className='h-10 w-10' />}
            title='Custom Chatbots'
            description='Create AI-powered chatbots tailored to your specific business needs and data.'
          />
          <FeatureCard
            icon={<FileText className='h-10 w-10' />}
            title='PDF & Website Integration'
            description='Train your AI using PDFs and your website URL, making information retrieval quick and easy.'
          />
          <FeatureCard
            icon={<Building2 className='h-10 w-10' />}
            title='Internal & External Use'
            description='Deploy chatbots for customer-facing websites or internal company use.'
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className='flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm'>
      <div className='rounded-full bg-primary/10 p-3 mb-4'>{icon}</div>
      <h3 className='text-xl font-semibold mb-2'>{title}</h3>
      <p className='text-muted-foreground'>{description}</p>
    </div>
  );
}
