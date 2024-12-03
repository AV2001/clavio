import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/app/_components/shadcn/tabs';
import UsageTab from './UsageTab';
import BillingTab from './BillingTab';
import TeamsTab from './TeamsTab';
import AccountTab from './AccountTab';

export default async function Settings() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  if (!isAdmin) {
    redirect('/chatbots');
  }

  return (
    <>
      <h1 className='text-3xl font-bold mb-8'>Settings</h1>

      <Tabs defaultValue='usage' className='w-full'>
        <TabsList>
          <TabsTrigger value='usage'>Usage</TabsTrigger>
          <TabsTrigger value='billing'>Billing</TabsTrigger>
          <TabsTrigger value='team'>Team</TabsTrigger>
          <TabsTrigger value='account'>Account</TabsTrigger>
        </TabsList>

        <TabsContent value='usage' className='mt-6'>
          <UsageTab />
        </TabsContent>

        <TabsContent value='billing' className='mt-6'>
          <BillingTab />
        </TabsContent>

        <TabsContent value='team' className='mt-6'>
          <TeamsTab />
        </TabsContent>

        <TabsContent value='account' className='mt-6'>
          <AccountTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
