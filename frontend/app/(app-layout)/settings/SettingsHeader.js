'use client';

import { usePathname, useRouter } from 'next/navigation';
import Heading from '@/app/_components/Heading';
import { Tabs, TabsList, TabsTrigger } from '@/app/_components/shadcn/tabs';

export default function SettingsHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // Get the current tab from the pathname
  const currentTab =
    pathname === '/settings' ? 'usage' : pathname.split('/').pop();

  const handleTabChange = (value) => {
    if (value === 'usage') {
      router.push('/settings');
    } else {
      router.push(`/settings/${value}`);
    }
  };

  return (
    <div className='space-y-6'>
      <Heading>Settings</Heading>
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <TabsList>
          <TabsTrigger value='usage'>Usage</TabsTrigger>
          <TabsTrigger value='billing'>Billing</TabsTrigger>
          <TabsTrigger value='team'>Team</TabsTrigger>
          <TabsTrigger value='account'>Account</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
