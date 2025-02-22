'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { PublicNavbar } from '@/components/PublicNavbar';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import ErrorMessage from '@/components/ErrorMessage';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * handle sending message
   * @param userInput - user input message
   */
  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    // add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: userInput
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      //add AI reply message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.generated_response,
        role: 'assistant',
        timestamp: new Date(),
        source: data.source_url
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-4xl mx-auto px-4 py-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-xl font-semibold text-white text-center flex items-center justify-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              VaxChecker——VaccineInfo Fact-check Assistant
            </h2>
          </div>
          
          <div className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="mb-2">👋 Hello! I am your vaccine consultation assistant</p>
                    <p>you can ask me any questions about vaccines</p>
                  </div>
                </div>
              ) : (
                <MessageList messages={messages} isLoading={isLoading} />
              )}
            </div>
            
            <div className="border-t p-4 bg-white">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}
    </div>
  );
} 