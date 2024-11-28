import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/app/_components/Navigation';
import CTAButton from '@/app/_components/CTAButton';
import { Button } from '@/app/_components/shadcn/button';
import Integrations from '@/app/_components/Integrations';
import { BoxReveal } from '@/app/_components/shadcn/box-reveal';
import FeaturesSection from '@/app/_components/FeaturesSection';
import HowItWorksSection from '@/app/_components/HowItWorksSection';
import PricingSection from '@/app/_components/PricingSection';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className='flex-grow px-6 mx-auto max-w-7xl'>
        <section className='py-20 md:py-32'>
          <div className='container'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-12'>
              <div className='max-w-2xl'>
                <BoxReveal>
                  <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl'>
                    Empower Your Business with AI-Driven Chatbots
                  </h1>
                </BoxReveal>
                <BoxReveal>
                  <p className='mt-6 text-xl text-muted-foreground'>
                    Clavio helps you create customizable AI-powered chatbots
                    that understand your business data, enhancing customer
                    support and internal communication.
                  </p>
                </BoxReveal>
                <BoxReveal>
                  <div className='mt-10 flex flex-col sm:flex-row gap-4'>
                    <CTAButton>
                      <Link href='/signup'>Get Started</Link>
                    </CTAButton>
                    <Button size='lg' variant='outline'>
                      <Link href='#how-it-works'>Learn More</Link>
                    </Button>
                  </div>
                </BoxReveal>
              </div>
              <div className='w-full max-w-md'>
                <Integrations />
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
      </main>

      <footer className='border-t border-border/40 mt-12'>
        <div className='container py-12 flex flex-col md:flex-row justify-between items-center px-6'>
          <div>
            <Image src='/logo.png' alt='Clavio Logo' width={100} height={100} />
          </div>
          <nav className='flex gap-4 mt-4 md:mt-0'>
            <Link
              href='#'
              className='text-sm text-muted-foreground hover:underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            <Link
              href='#'
              className='text-sm text-muted-foreground hover:underline underline-offset-4'
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
