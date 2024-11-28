import { Button } from '@/app/_components/shadcn/button';

export default function CTAButton({ children }) {
  return (
    <Button className='bg-primary-800 text-primary-50 hover:bg-primary-900 shadow-md'>
      {children}
    </Button>
  );
}
