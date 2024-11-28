import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const BorderBeam = ({
  className,
  children,
  duration = 5,
  borderWidth = 2,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  delay = 0,
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {children}
      <svg
        className='absolute inset-0 pointer-events-none'
        width='100%'
        height='100%'
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={dimensions.width - borderWidth}
          height={dimensions.height - borderWidth}
          stroke='url(#gradient)'
          strokeWidth={borderWidth}
          strokeLinecap='round'
          fill='none'
        />
        <defs>
          <motion.linearGradient
            id='gradient'
            gradientUnits='userSpaceOnUse'
            animate={{
              x1: [0, dimensions.width, dimensions.width, 0, 0],
              y1: [0, 0, dimensions.height, dimensions.height, 0],
              x2: [
                dimensions.width / 4,
                dimensions.width,
                dimensions.width,
                dimensions.width / 4,
                0,
              ],
              y2: [
                0,
                dimensions.height / 4,
                dimensions.height,
                dimensions.height,
                0,
              ],
            }}
            transition={{
              duration: duration,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            <stop stopColor={colorFrom} stopOpacity='0' offset='0%' />
            <stop stopColor={colorFrom} offset='25%' />
            <stop stopColor={colorTo} offset='50%' />
            <stop stopColor={colorTo} stopOpacity='0' offset='75%' />
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  );
};
