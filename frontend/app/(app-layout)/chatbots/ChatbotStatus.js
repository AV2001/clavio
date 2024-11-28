'use client';

import { useState } from 'react';
import StatusCell from './StatusCell';
import ChatbotTraining from './ChatbotTraining';

export default function ChatbotStatus({ chatbotId, initialStatus }) {
  const [statusData, setStatusData] = useState({
    status: initialStatus,
    message: '',
  });

  // Only render ChatbotTraining if status is explicitly 'training'
  const showTraining = statusData.status === 'training';

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <StatusCell
          chatbotId={chatbotId}
          initialStatus={initialStatus}
          onStatusUpdate={setStatusData}
        />
      </div>
      {showTraining && <ChatbotTraining message={statusData.message} />}
      {statusData.message && !showTraining && (
        <p className='text-sm text-gray-600 mt-2'>{statusData.message}</p>
      )}
    </div>
  );
}
