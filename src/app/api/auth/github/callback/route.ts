import { NextResponse } from 'next/server';
import { DynamoDBService } from '@/services/dynamodb';
import type { OAuthUserItem } from '@/types/user';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('GitHub authentication failed')}`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const githubUser = await userResponse.json();

    // Get user email
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const emails = await emailsResponse.json();
    const primaryEmail = emails.find((email: any) => email.primary)?.email;

    // Check if user exists
    let user = await DynamoDBService.getUserByEmail(primaryEmail);

    if (!user) {
      // Create new user
      user = {
        id: uuidv4(),
        email: primaryEmail,
        firstName: githubUser.name?.split(' ')[0] || '',
        lastName: githubUser.name?.split(' ').slice(1).join(' ') || '',
        githubId: githubUser.id,
        isVerified: true, // GitHub users are pre-verified
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await DynamoDBService.createUser(user);
    }

    // 检查是否存在 OAuth 用户
    let oauthUser = await DynamoDBService.getOAuthUser(primaryEmail, 'github');

    if (!oauthUser) {
      // 创建新的 OAuth 用户
      const userData: Partial<OAuthUserItem> = {
        email: primaryEmail,
        firstName: githubUser.name?.split(' ')[0] || '',
        lastName: githubUser.name?.split(' ').slice(1).join(' ') || '',
        provider: 'github',
        providerId: githubUser.id.toString(),
      };

      oauthUser = await DynamoDBService.createOAuthUser(userData);
    }

    // 设置认证 cookie
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(`${baseUrl}/`);  // 改为重定向到主页
    
    // 在 cookie 中添加登录类型标识
    response.cookies.set('auth_token', primaryEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    response.cookies.set('auth_type', 'oauth', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('GitHub callback error:', error);
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('Authentication failed')}`
    );
  }
} 