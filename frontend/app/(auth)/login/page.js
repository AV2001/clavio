import Link from 'next/link';
import { Button } from '@/app/_components/shadcn/button';
import { Input } from '@/app/_components/shadcn/input';
import { Label } from '@/app/_components/shadcn/label';
import GoogleButton from '@/app/_components/GoogleButton';
import MicrosoftButton from '@/app/_components/MicrosoftButton';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <>
      <h1 className='text-3xl font-bold text-center mb-8'>Welcome back</h1>

      <form className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email address</Label>
          <Input id='email' type='email' required />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' type='password' required />
        </div>

        <Button className='w-full bg-primary-800 hover:bg-primary-900 text-white'>
          Continue
        </Button>
      </form>

      <div className='mt-6 text-center text-sm'>
        Don't have an account?{' '}
        <Link
          href='/signup'
          className='text-primary-500 hover:text-primary-600'
        >
          Sign Up
        </Link>
      </div>

      <div className='relative my-8'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-200'></div>
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white text-gray-500'>OR</span>
        </div>
      </div>

      <div className='space-y-3 flex flex-col items-center'>
        <GoogleButton />
        <MicrosoftButton />
      </div>
    </>
  );
}
