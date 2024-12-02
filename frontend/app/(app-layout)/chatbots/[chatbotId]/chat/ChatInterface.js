'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/_components/shadcn/button';
import { Input } from '@/app/_components/shadcn/input';
import { Send } from 'lucide-react';
import Loader from '@/app/_components/Loader';

export default function ChatInterface({ chatbot }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isFirstMessageSent, setIsFirstMessageSent] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initialConnectionMadeRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const params = new URLSearchParams({
      fullName: 'Internal User',
      email: 'internal@example.com'
    });
    
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${chatbot.embedId}/?${params.toString()}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to chat server');
      initialConnectionMadeRef.current = true;
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data).response;
      if (response && initialConnectionMadeRef.current) {
        setMessages(prev => prev.map(msg => 
          msg.isTyping ? { role: 'assistant', content: response } : msg
        ));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
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

    if (!isFirstMessageSent) {
      setIsFirstMessageSent(true);
    }

    setMessages(prev => [...prev, 
      { role: 'user', content: inputMessage },
      { role: 'assistant', isTyping: true }
    ]);

    wsRef.current.send(JSON.stringify({ query: inputMessage }));
    setInputMessage('');
  };

  const TypingIndicator = () => (
    <div className="flex gap-1 p-2">
      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
    </div>
  );

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <form onSubmit={sendMessage} className="w-full max-w-2xl">
          <div className="w-full flex items-center gap-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${chatbot.name}...`}
              className="flex-1 h-[72px]"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-black hover:bg-gray-800"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
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
              {message.isTyping ? <TypingIndicator /> : message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={sendMessage} 
        className={`border-t p-4 bg-gray-50 transition-all duration-300 ease-out ${
          isFirstMessageSent ? 'animate-slide-up' : ''
        }`}
      >
        <div className="w-full flex gap-2">
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