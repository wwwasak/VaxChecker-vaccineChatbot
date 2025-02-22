import { NextResponse } from 'next/server';

export async function GET() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${
    process.env.GITHUB_CLIENT_ID
  }&scope=user:email`;

  return NextResponse.json({ url: githubAuthUrl });
} 