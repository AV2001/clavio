'use client';

import { useRouter } from 'next/navigation';
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
        {chatbots.map((chatbot) => (
          <TableRow
            key={chatbot.id}
            onClick={() => router.push(`/chatbots/${chatbot.id}`)}
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
