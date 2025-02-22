import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function withAuth(handler: Function) {
  return async (request: Request) => {
    const authToken = cookies().get('auth_token');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      return await handler(request, authToken.value);
    } catch (error) {
      console.error('Error in authenticated request:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 