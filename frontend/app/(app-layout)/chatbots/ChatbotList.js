'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/_components/shadcn/table';
import { format } from 'date-fns';
import StatusCell from './StatusCell';

export default function ChatbotList({ chatbots }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  // Filter chatbots based on isAdmin status
  const filteredChatbots = isAdmin ? chatbots : chatbots.filter(chatbot => chatbot.chatbotType === 'internal');

  return (
    <Table>
      <TableHeader>
        <TableRow className='hover:bg-transparent cursor-default'>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredChatbots.map((chatbot) => (
          <TableRow
            key={chatbot.id}
            onClick={() =>
              router.push(isAdmin ? `/chatbots/${chatbot.id}` : `/chatbots/${chatbot.id}/chat`)
            }
          >
            <TableCell>{chatbot.name}</TableCell>
            <TableCell>
              <StatusCell
                chatbotId={chatbot.id}
                initialStatus={chatbot.status}
              />
            </TableCell>
            <TableCell>
              {format(new Date(chatbot.createdAt), 'MMM do, yyyy')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
