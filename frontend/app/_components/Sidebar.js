import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import ClientSideNavigation from './ClientSideNavigation';

export default async function Sidebar() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  return (
    <nav className='bg-white border-primary-200 row-start-1 row-span-2 shadow-sm flex flex-col gap-8'>
      <div className='flex flex-col items-center pt-4'>
        <Link href='/dashboard' className='relative w-16 h-16'>
          <Image src='/icon.png' alt='Clavio Logo' fill />
        </Link>
      </div>
      <ClientSideNavigation isAdmin={isAdmin} />
    </nav>
  );
}
