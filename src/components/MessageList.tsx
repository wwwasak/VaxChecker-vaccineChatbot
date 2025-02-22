import { Message } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useState, useEffect, useRef } from 'react'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = [
    "Connecting to the authoritative vaccine information database...",
    "Retrieving relevant information...",
    "Generating detailed response..."
  ];

  //auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, loadingMessageIndex])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  return (
    <div className="space-y-4">
      {/* normal message */}
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`
            max-w-[80%] 
            ${message.role === 'user' 
              ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl' 
              : 'bg-gray-100 text-gray-800 rounded-r-2xl rounded-tl-2xl'
            }
            px-6 py-4 shadow-sm
          `}>
            <div className="text-sm mb-1">
              {message.role === 'user' ? 'You' : 'VaxChecker'}
              <span className="text-xs opacity-70 ml-2">
                {format(message.timestamp, 'HH:mm', { locale: zhCN })}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
      
      {/* loading status message */}
      {isLoading && (
        <div className="flex justify-start animate-fade-in">
          <div className="bg-gray-50 text-gray-800 rounded-r-2xl rounded-tl-2xl px-6 py-4 shadow-sm max-w-[80%]">
            <div className="text-sm mb-1">
              VaxChecker
              <span className="text-xs opacity-70 ml-2">
                {format(new Date(), 'HH:mm', { locale: zhCN })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-gray-600">
                {loadingMessages[loadingMessageIndex]}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* empty div for auto scroll */}
      <div ref={messagesEndRef} />
    </div>
  )
} 