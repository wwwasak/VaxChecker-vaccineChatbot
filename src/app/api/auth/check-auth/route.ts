import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || ''
  }
});

export async function GET() {
  try {
    const authToken = cookies().get('auth_token');
    
    if (!authToken?.value) {
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }

    // 使用email(auth_token)查询用户
    const result = await dynamodb.query({
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME || 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': authToken.value
      }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }

    // 用户存在，返回成功
    return NextResponse.json({ 
      isLoggedIn: true,
      user: {
        email: result.Items[0].email,
        firstName: result.Items[0].firstName,
        lastName: result.Items[0].lastName
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
} 