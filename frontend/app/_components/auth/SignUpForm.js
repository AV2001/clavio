'use client';

import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const isInvite = searchParams.get('type') === 'invite';
  const inviteToken = searchParams.get('token');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('isInvite', isInvite);
      formData.append('organizationName', data.organizationName);

      if (isInvite && inviteToken) {
        formData.append('inviteToken', inviteToken);
      }

      const result = await signUpAction(formData);

      if (result.success) {
        toast.success(result.message);
        router.push('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message);
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
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>Email address</Label>
        <Input
          id='email'
          type='email'
          {...register('email', { required: 'Email is required' })}
        />
      </div>

      {!isInvite && (
        <div className='space-y-2'>
          <Label htmlFor='organizationName'>Organization Name</Label>
          <Input
            id='organizationName'
            {...register('organizationName', {
              required: 'Organization name is required',
            })}
          />
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          type='password'
          {...register('password', { required: 'Password is required' })}
        />
      </div>

      <Button
        type='submit'
        className='w-full bg-primary-800 hover:bg-primary-900 text-white'
        disabled={isSubmitting}
      >
        {isSubmitting ? <MiniLoader /> : 'Sign In'}
      </Button>
    </form>
  );
}
