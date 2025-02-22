import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '@/services/dynamodb';

export async function GET(request: Request) {
  try {
    const sessions = await DynamoDBService.getChatSessions('user@example.com');
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = {
      id: uuidv4(),
      userId: 'user@example.com',
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createChatSession(session);
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
} 