'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/app/_components/shadcn/button';
import { Input } from '@/app/_components/shadcn/input';
import { Label } from '@/app/_components/shadcn/label';
import { signUpAction } from '@/app/_actions/authActions';
import { toast } from 'react-toastify';
import MiniLoader from '@/app/_components/MiniLoader';

export default function SignUpForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('password', data.password);

      const result = await signUpAction(formData);

      if (result.success) {
        toast.success(result.message);
        router.push('/login');
      } else {
        setError('email', {
          type: 'server',
          message: result.error,
        });
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='fullName'>Full Name</Label>
        <Input
          id='fullName'
          {...register('fullName', { required: 'Full name is required' })}
        />
        {errors.fullName && (
          <p className='text-sm text-red-500'>{errors.fullName.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>Email address</Label>
        <Input
          id='email'
          type='email'
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && (
          <p className='text-sm text-red-500'>{errors.email.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          type='password'
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
        />
        {errors.password && (
          <p className='text-sm text-red-500'>{errors.password.message}</p>
        )}
      </div>

      <Button
        type='submit'
        className='w-full bg-primary-800 hover:bg-primary-900 text-white'
        disabled={isSubmitting}
      >
        {isSubmitting ? <MiniLoader /> : 'Create Account'}
      </Button>
    </form>
  );
}
