import { NextResponse } from 'next/server';
import { DynamoDBService } from '@/services/dynamodb';
import { cookies } from 'next/headers';

export async function DELETE(
  request: Request,
  { params }: { params: { email: string } }
) {
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

    // 删除用户
    await DynamoDBService.deleteUser(params.email);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 