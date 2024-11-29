'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/_components/shadcn/button';
import { Input } from '@/app/_components/shadcn/input';
import { Send } from 'lucide-react';

export default function ChatInterface({ chatbot }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Add query parameters for full_name and email
    const params = new URLSearchParams({
      fullName: 'Internal User',
      email: 'internal@example.com'
    });
    
    // Use embedId and include query parameters in WebSocket URL
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${chatbot.embedId}/?${params.toString()}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to chat server');
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data).response;
      if (response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from chat server');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [chatbot.embedId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !wsRef.current) return;

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);

    // Send message through WebSocket
    wsRef.current.send(JSON.stringify({ query: inputMessage }));

    // Clear input
    setInputMessage('');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="border-t p-4 bg-gray-50">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${chatbot.name}...`}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="bg-black hover:bg-gray-800">
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
} 