'use client';

import { useRouter } from 'next/navigation';
import { useGetChatbots } from '@/app/_hooks/useGetChatbots';
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

export default function ChatbotList({ initialChatbots, isAdmin }) {
  const router = useRouter();
  const { chatbots = initialChatbots, error } = useGetChatbots({
    initialData: initialChatbots,
  });

  // Filter chatbots based on isAdmin status
  const filteredChatbots = isAdmin
    ? chatbots
    : chatbots.filter((chatbot) => chatbot.chatbotType === 'internal');

  if (error) {
    return (
      <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
        <p className='text-red-600'>{error.message}</p>
      </div>
    );
  }

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
              router.push(
                isAdmin
                  ? `/chatbots/${chatbot.id}`
                  : `/chatbots/${chatbot.id}/chat`
              )
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
