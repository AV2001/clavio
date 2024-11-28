import Logo from '@/app/_components/Logo';

export default function AuthLayout({ children }) {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-sm'>
        <div className='flex justify-center mb-8'>
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
