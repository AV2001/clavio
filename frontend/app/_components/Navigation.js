'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/app/_components/shadcn/button';
import { Menu, X } from 'lucide-react';
import CTAButton from '@/app/_components/CTAButton';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/app/_components/Logo';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleSmoothScroll = (e) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute('href');
      if (href.startsWith('#')) {
        const targetId = href.substring(1);
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 mx-auto max-w-7xl'>
      <div className='container flex h-16 items-center'>
        <Link href='/' className='flex items-center space-x-2'>
          <Logo />
        </Link>
        <nav className='hidden md:flex items-center space-x-4 sm:space-x-6 mx-auto'>
          <Link
            href='#features'
            className='text-sm font-medium hover:underline underline-offset-4'
          >
            Features
          </Link>
          <Link
            href='#how-it-works'
            className='text-sm font-medium hover:underline underline-offset-4'
          >
            How It Works
          </Link>
          <Link
            href='#pricing'
            className='text-sm font-medium hover:underline underline-offset-4'
          >
            Pricing
          </Link>
        </nav>
        <div className='hidden md:flex items-center space-x-4'>
          <Link
            href='/login'
            className='text-sm font-medium hover:underline underline-offset-4'
          >
            Login
          </Link>
          <CTAButton>
            <Link href='/signup' className='text-sm font-medium'>
              Sign up
            </Link>
          </CTAButton>
        </div>
        <Button
          variant='ghost'
          className='ml-auto md:hidden'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className='!h-6 !w-6' />
          ) : (
            <Menu className='!h-6 !w-6' />
          )}
        </Button>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className='container py-4 md:hidden flex flex-col items-center w-full absolute top-full left-0 bg-white'
          >
            <Link
              href='#features'
              className='block py-2 text-sm font-medium hover:underline underline-offset-4 w-full text-center'
            >
              Features
            </Link>
            <Link
              href='#how-it-works'
              className='block py-2 text-sm font-medium hover:underline underline-offset-4 w-full text-center'
            >
              How It Works
            </Link>
            <Link
              href='#pricing'
              className='block py-2 text-sm font-medium hover:underline underline-offset-4 w-full text-center'
            >
              Pricing
            </Link>
            <Link
              href='/login'
              className='block py-2 text-sm font-medium hover:underline underline-offset-4 w-full text-center'
            >
              Login
            </Link>
            <CTAButton asChild className='mt-2 w-full'>
              <Link href='/signup' className='text-sm font-medium'>
                Sign up
              </Link>
            </CTAButton>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
