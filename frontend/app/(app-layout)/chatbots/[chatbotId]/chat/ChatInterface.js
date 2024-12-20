"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function ChatInterface({ chatbot }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const eventSourceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/chatbots/chat/${chatbot.id}/stream/`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = (event) => {
      console.log("SSE Connection opened", event);
    };

    eventSource.onmessage = (event) => {
      console.log("SSE Message:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "connected") {
          console.log("SSE Connected successfully");
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [chatbot.id]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setMessages((prev) => [...prev, { text: messageText, isUser: true }]);
    setInputMessage("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbots/chat/${chatbot.id}/send/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: messageText,
            email: session?.user?.email || "admin@test.com",
          }),
        }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processLine = async (line) => {
        if (line.trim() && line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            console.log("Received data:", data);

            if (data.type === "stream") {
              await new Promise(resolve => setTimeout(resolve, 50)); // Add small delay
              setStreamingMessage(prev => prev + data.chunk);
            } else if (data.type === "final") {
              setMessages((prev) => [
                ...prev,
                {
                  text: data.response,
                  isUser: false,
                },
              ]);
              setStreamingMessage("");
              setIsLoading(false);
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process any complete lines in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          await processLine(line);
        }
      }

      // Process any remaining data in the buffer
      if (buffer) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          await processLine(line);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error sending your message.",
          isUser: false,
          isError: true,
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isConnected ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Connecting to chat...</div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.isUser
                      ? "bg-primary-600 text-white"
                      : message.isError
                      ? "bg-red-100 text-red-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-100 text-gray-900">
                  {streamingMessage}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                disabled={isLoading}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
