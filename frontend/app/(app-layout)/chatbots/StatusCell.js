'use client';

import { useWebSocket } from '@/app/_hooks/useWebSocket';
import { useEffect } from 'react';

export default function StatusCell({
  chatbotId,
  initialStatus,
  onStatusUpdate,
}) {
  const { status, message } = useWebSocket(chatbotId, initialStatus);

  useEffect(() => {
    if (onStatusUpdate && status) {
      onStatusUpdate({ status, message });
    }
  }, [status, message, onStatusUpdate]);

  const styles = {
    training: 'bg-yellow-100 text-yellow-800',
    live: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  if (!status) return null;

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
