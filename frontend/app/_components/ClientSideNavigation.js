'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bot, User, Plus } from 'lucide-react';

export default function ClientSideNavigation({ isAdmin }) {
  const pathname = usePathname();

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

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  return (
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
  );
}
