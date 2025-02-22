import type { ChatSession } from '@/types/chat';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (session: ChatSession) => void;
}

export function ChatHistory({
  sessions,
  currentSession,
  onSelectSession,
}: ChatHistoryProps) {
  return (
    <div className="overflow-y-auto h-full">
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelectSession(session)}
          className={`w-full p-4 text-left hover:bg-gray-50 ${
            currentSession?.id === session.id ? 'bg-gray-100' : ''
          }`}
        >
          <div className="font-medium truncate">{session.title}</div>
          <div className="text-sm text-gray-500">
            {new Date(session.updatedAt).toLocaleDateString()}
          </div>
        </button>
      ))}
    </div>
  );
} 