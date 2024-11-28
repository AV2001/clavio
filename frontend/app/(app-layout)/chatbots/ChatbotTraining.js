'use client';

import { motion } from 'framer-motion';
import { Bot, Server, Cpu, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const defaultSteps = [
  {
    icon: Server,
    title: 'Processing Data',
    description: 'Analyzing and preparing your documents',
    status: 'training',
  },
  {
    icon: Cpu,
    title: 'Training Model',
    description: 'Teaching AI to understand your content',
    status: 'training',
  },
  {
    icon: Bot,
    title: 'Finalizing',
    description: 'Setting up your custom chatbot',
    status: 'training',
  },
];

export default function ChatbotTraining({ message }) {
  const [steps, setSteps] = useState(defaultSteps);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!message) return;

    // Update the current step based on the message
    if (message.includes('Processing')) {
      setCurrentStep(0);
      updateStepStatus(0, 'active');
    } else if (message.includes('Training')) {
      setCurrentStep(1);
      updateStepStatus(0, 'completed');
      updateStepStatus(1, 'active');
    } else if (
      message.includes('Finalizing') ||
      message.includes('completed')
    ) {
      setCurrentStep(2);
      updateStepStatus(1, 'completed');
      updateStepStatus(2, 'active');
    }

    // Update the description of the current step with the actual message
    setSteps((prevSteps) =>
      prevSteps.map((step, index) =>
        index === currentStep ? { ...step, description: message } : step
      )
    );
  }, [message, currentStep]);

  const updateStepStatus = (stepIndex, status) => {
    setSteps((prevSteps) =>
      prevSteps.map((step, index) =>
        index === stepIndex ? { ...step, status } : step
      )
    );
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='flex items-center gap-3 mb-6'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className='w-8 h-8 text-primary-600'
        >
          <Bot className='w-full h-full' />
        </motion.div>
        <div>
          <h3 className='font-semibold text-lg'>Training in Progress</h3>
          <p className='text-sm text-gray-500'>
            {message || 'Please wait while we train your chatbot'}
          </p>
        </div>
      </div>

      <div className='space-y-6'>
        {steps.map((step, index) => (
          <div key={step.title} className='flex items-start gap-4'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className='relative'
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed'
                    ? 'bg-green-50'
                    : step.status === 'active'
                    ? 'bg-primary-50'
                    : 'bg-gray-50'
                }`}
                animate={{
                  scale: step.status === 'active' ? [1, 1.1, 1] : 1,
                  opacity: step.status === 'active' ? [0.5, 1, 0.5] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: step.status === 'active' ? Infinity : 0,
                  delay: index * 0.5,
                }}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className='w-5 h-5 text-green-600' />
                ) : (
                  <step.icon
                    className={`w-5 h-5 ${
                      step.status === 'active'
                        ? 'text-primary-600'
                        : 'text-gray-400'
                    }`}
                  />
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  className='absolute left-1/2 top-12 w-0.5 h-8 bg-gray-200'
                  initial={{ height: 0 }}
                  animate={{ height: 32 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                />
              )}
            </motion.div>
            <div className='flex-1 pt-1'>
              <h4 className='font-medium text-gray-900'>{step.title}</h4>
              <p className='text-sm text-gray-500'>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        className='mt-6 h-2 bg-gray-100 rounded-full overflow-hidden'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className='h-full bg-primary-600 rounded-full'
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 15,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  );
}
