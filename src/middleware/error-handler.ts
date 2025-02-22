import { NextResponse } from 'next/server';

export function errorHandler(error: any) {
  console.error('Authentication error:', error);
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const errorMessage = encodeURIComponent(
    error.message || 'Authentication failed'
  );
  
  return NextResponse.redirect(
    `${baseUrl}/login?error=${errorMessage}`
  );
} 