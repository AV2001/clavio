import Link from 'next/link';
import LoginForm from '@/app/_components/auth/LoginForm';
import GoogleButton from '@/app/_components/GoogleButton';
import MicrosoftButton from '@/app/_components/MicrosoftButton';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <>
      <h1 className='text-3xl font-bold text-center mb-8'>Welcome back</h1>
      <LoginForm />

      <div className='mt-6 text-center text-sm'>
        Don&apos;t have an account?{' '}
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
