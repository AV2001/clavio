'use client';
import { useEffect, useState } from 'react';
// ... other imports ...

export default function Chat({ params }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Send initial connection message with chatbot ID
      ws.send(JSON.stringify({
        type: 'init',
        chatbotId: params.chatbotID
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, {
        role: data.role,
        content: data.content
      }]);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [params.chatbotID]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !isConnected) return;

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: inputMessage
    }]);

    // Send message through WebSocket
    socket.send(JSON.stringify({
      type: 'message',
      content: inputMessage,
      chatbotId: params.chatbotID
    }));

    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${
              message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type your message..."
          />
          <button 
            type="submit"
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 