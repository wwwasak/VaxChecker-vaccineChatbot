import { NextResponse } from 'next/server';
import { DynamoDBService } from '@/services/dynamodb';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types/user';

export async function GET() {
  console.log('API route hit: /api/user/profile'); // debug log
  
  try {
    const authToken = cookies().get('auth_token');
    console.log('Auth token:', authToken); // debug log
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = authToken.value;
    console.log('Fetching profile for email:', email); // debug log

    const user = await DynamoDBService.getUserByEmail(email);
    console.log('DynamoDB response:', user); // debug log

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // convert data format to match frontend requirements
    const userProfile: UserProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      phone: user.phone,
      address: user.address,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error in profile API:', error); // debug log
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authToken = cookies().get('auth_token');
    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = authToken.value;
    const updates = await request.json();

    // get existing user data
    const existingUser = await DynamoDBService.getUserByEmail(email);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // merge updates
    const updatedUser = {
      ...existingUser,
      ...updates,
      email, // keep email unchanged
      updatedAt: new Date().toISOString()
    };

    // update database
    await DynamoDBService.updateUser(updatedUser);

    // do not return password
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 