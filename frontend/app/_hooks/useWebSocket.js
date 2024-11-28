'use client';

import { useEffect, useState, useRef } from 'react';

// Create a global status cache
const statusCache = new Map();

export function useWebSocket(chatbotId, initialStatus) {
  // Use the cached status if available, otherwise use initialStatus
  const [status, setStatus] = useState(
    () => statusCache.get(chatbotId) || initialStatus
  );
  const [message, setMessage] = useState('');
  const wsRef = useRef(null);
  const hasInitialized = useRef(false);

  // Update cache whenever status changes
  useEffect(() => {
    statusCache.set(chatbotId, status);
  }, [chatbotId, status]);

  useEffect(() => {
    // If we have a cached status that's 'live', don't start WebSocket
    if (!chatbotId || status === 'live' || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    console.log(`Initializing WebSocket for training chatbot ${chatbotId}`);
    console.log(process.env.NEXT_PUBLIC_WS_URL);
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/chatbot/${chatbotId}/status/`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket Connected for chatbot ${chatbotId}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`WebSocket message received for chatbot ${chatbotId}:`, data);
      setStatus(data.status);
      setMessage(data.message);

      if (data.status !== 'training') {
        console.log(
          `Training completed for chatbot ${chatbotId}, closing connection`
        );
        ws.close();
        wsRef.current = null;
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log(`Cleaning up WebSocket for chatbot ${chatbotId}`);
        ws.close();
        wsRef.current = null;
      }
    };
  }, [chatbotId, status]);

  return { status, message };
}
