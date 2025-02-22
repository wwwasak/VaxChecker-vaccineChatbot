import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '@/services/dynamodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const messages = await DynamoDBService.getChatMessages(sessionId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, content } = body;

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: 'Session ID and content are required' },
        { status: 400 }
      );
    }

    // create user message
    const userMessage = {
      id: uuidv4(),
      sessionId,
      role: 'user' as const,
      content,
      createdAt: new Date().toISOString(),
    };

    await DynamoDBService.createChatMessage(userMessage);

    // TODO: call AI API to get response
    const assistantMessage = {
      id: uuidv4(),
      sessionId,
      role: 'assistant' as const,
      content: 'This is a mock response. AI integration pending.',
      createdAt: new Date().toISOString(),
    };

    await DynamoDBService.createChatMessage(assistantMessage);

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Failed to create chat message' },
      { status: 500 }
    );
  }
} 