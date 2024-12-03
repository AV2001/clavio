'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Bot, User, Plus } from 'lucide-react';

const adminNavLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Create Chatbot', href: '/chatbots/create', icon: Plus },
  { name: 'My Chatbots', href: '/chatbots', icon: Bot },
  { name: 'Settings', href: '/settings', icon: User },
];

const userNavLinks = [
  { name: 'My Chatbots', href: '/chatbots', icon: Bot },
  { name: 'My Account', href: '/account', icon: User },
];

function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  return (
    <nav className='bg-white border-primary-200 row-start-1 row-span-2 shadow-sm flex flex-col gap-8'>
      <div className='flex flex-col items-center pt-4'>
        <Link href='/dashboard' className='relative w-16 h-16'>
          <Image src='/icon.png' alt='Clavio Logo' fill />
        </Link>
      </div>
      <ul className='flex flex-col items-start gap-1 w-full'>
        {navLinks.map((link) => (
          <li key={link.name} className='w-full'>
            <Link
              className={`w-full py-2 px-4 text-primary-900 transition-colors flex items-center gap-3 font-medium`}
              href={link.href}
            >
              <span
                className={`w-full flex items-center gap-3 rounded-md py-2 px-4 ${
                  pathname === link.href
                    ? 'bg-primary-100'
                    : 'hover:bg-primary-100'
                }`}
              >
                {link.icon && <link.icon className='w-5 h-5 flex-shrink-0' />}
                <span>{link.name}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
