import { NextResponse } from 'next/server';
import { DynamoDBService } from '@/services/dynamodb';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 验证管理员权限
    const authToken = cookies().get('auth_token');
    if (!authToken?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await DynamoDBService.getUserByEmail(authToken.value);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取所有用户
    const users = await DynamoDBService.getAllUsers();
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 