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
import { MessageCircle } from 'lucide-react';
import { Button } from '@/app/_components/shadcn/button';

export default function ChatbotList({ chatbots }) {
  const router = useRouter();

  const handleChatClick = (e, chatbotId) => {
    e.stopPropagation(); // Prevent row click event
    router.push(`/chatbots/${chatbotId}/chat`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className='hover:bg-transparent cursor-default'>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Chat</TableHead>
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
            <TableCell>
              {chatbot.chatbotType === 'internal' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleChatClick(e, chatbot.id)}
                  className="hover:bg-gray-100"
                >
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
