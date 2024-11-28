'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import WordFadeIn from '@/app/_components/shadcn/word-fade-in';

export default function HowItWorksSection() {
  const howItWorksRef = useRef(null);
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.2 });

  return (
    <section id='how-it-works' className='py-20' ref={howItWorksRef}>
      <div className='container'>
        {howItWorksInView && (
          <WordFadeIn
            words="How It Works"
            className="text-3xl font-bold text-center mb-12"
          />
        )}
        <div className='max-w-3xl mx-auto'>
          <ol className='relative border-lborder-muted-foreground/30'>
            <Step number={1} title='Upload Your Data'>
              Securely upload your company's documents, PDFs, and provide
              your website URL to Clavio.
            </Step>
            <Step number={2} title='Train Your Chatbot'>
              Our AI processes your data and learns to understand your
              business context.
            </Step>
            <Step number={3} title='Customize & Deploy'>
              Tailor your chatbot's appearance and behavior, then deploy it
              to your chosen platforms.
            </Step>
            <Step number={4} title='Engage & Improve'>
              Start engaging with users while continuously improving your
              chatbot's performance.
            </Step>
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({ number, title, children }) {
  return (
    <li className='mb-10 ml-6'>
      <span className='absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-background'>
        {number}
      </span>
      <h3 className='font-semibold text-xl mb-2'>{title}</h3>
      <p className='text-muted-foreground'>{children}</p>
    </li>
  );
}
