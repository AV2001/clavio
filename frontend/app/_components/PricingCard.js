'use client';

import { motion } from 'framer-motion';
import CTAButton from "@/app/_components/CTAButton";

export default function PricingCard({ title, price, features, cta }) {
  return (
    <motion.div
      className="flex flex-col p-6 bg-white rounded-lg shadow-lg transition-shadow hover:shadow-xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <h3 className="text-2xl font-bold text-center mb-4">{title}</h3>
      <div className="text-center mb-6">
        <span className="text-5xl font-bold">${price}</span>
        <span className="text-xl font-normal">/mo</span>
      </div>
      <ul className="mb-8 space-y-4 flex-grow">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            className="flex items-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="mr-2 font-bold text-black">•</span>
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
      <CTAButton className="w-full text-center py-3">{cta}</CTAButton>
    </motion.div>
  );
}
