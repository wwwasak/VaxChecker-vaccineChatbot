import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  //  delete auth cookie
  cookies().delete('auth_token');

  return NextResponse.json({
    message: 'Logged out successfully'
  });
} 