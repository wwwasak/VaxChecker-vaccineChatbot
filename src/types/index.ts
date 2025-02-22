/**
 * user info interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
}

/**
 * user preferences interface
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

/**
 * chat message interface
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

/**
 * chat session interface
 */
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * news article interface
 */
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  source: string;
  tags: string[];
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  source?: string
} 