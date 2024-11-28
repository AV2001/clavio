'use client';

import React, { forwardRef, useRef } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/app/_components/shadcn/animated-beam';
import { BorderBeam } from './shadcn/border-beam';

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = 'Circle';

function Integrations({ className }) {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);

  return (
    <BorderBeam>
      <div
        className={cn(
          'relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10',
          'bg-white/30 backdrop-blur-md',
          'border border-white/20 rounded-xl shadow-[0_0_15px_-10px_rgba(0,0,0,0.3)]',
          className
        )}
        ref={containerRef}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div
          className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'
          aria-hidden='true'
        >
          <div
            className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          ></div>
        </div>
        <div className='flex size-full flex-row items-stretch justify-between gap-10 max-w-lg relative z-10'>
          <div className='flex flex-col justify-center gap-2'>
            <Circle ref={div1Ref}>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'
                  stroke='#000'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
                  stroke='#000'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </Circle>
            <Circle ref={div2Ref}>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'
                  stroke='#000'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <polyline
                  points='14 2 14 8 20 8'
                  stroke='#000'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <line
                  x1='16'
                  y1='13'
                  x2='8'
                  y2='13'
                  stroke='#000'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <line
                  x1='16'
                  y1='17'
                  x2='8'
                  y2='17'
                  stroke='#000'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <polyline
                  points='10 9 9 9 8 9'
                  stroke='#000'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </Circle>
          </div>
          <div className='flex flex-col justify-center'>
            <Circle ref={div3Ref} className='size-16'>
              <Image src='/icon.png' alt='Clavio Icon' width={40} height={40} />
            </Circle>
          </div>
          <div className='flex flex-col justify-center'>
            <Circle ref={div4Ref}>
              <Icons.user />
            </Circle>
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div3Ref}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div2Ref}
          toRef={div3Ref}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div3Ref}
          toRef={div4Ref}
        />
      </div>
    </BorderBeam>
  );
}

const Icons = {
  user: () => (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#000000'
      strokeWidth='2'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
      <circle cx='12' cy='7' r='4' />
    </svg>
  ),
};

export default Integrations;
