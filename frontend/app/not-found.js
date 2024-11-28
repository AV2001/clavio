import Link from 'next/link';
import { Button } from '@/app/_components/shadcn/button';

export default function NotFound() {
  return (
    <main className='flex-grow px-6 mx-auto max-w-7xl min-h-screen flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4'>
        404
      </h1>
      <p className='text-xl text-muted-foreground mb-8'>
        Oops! The page you're looking for doesn't exist.
      </p>
      <Button className='bg-primary-800 hover:bg-primary-900 text-white'>
        <Link href='/'>Back to Home</Link>
      </Button>
    </main>
  );
}
