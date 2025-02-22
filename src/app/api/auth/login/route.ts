import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DynamoDBService } from '@/services/dynamodb';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Login attempt for:', body.email);

    const user = await DynamoDBService.getUserByEmail(body.email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(body.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 设置认证 cookie
    cookies().set('auth_token', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // 移除密码字段
    const { password, ...userWithoutPassword } = user;

    // 根据用户角色返回不同的响应
    if (user.role === 'admin') {
      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword,
        redirectTo: '/admin'  // 添加重定向路径
      });
    }

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 