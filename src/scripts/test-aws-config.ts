import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { DynamoDBService } from '../services/dynamodb';
import type { User } from '../types/user';
import { validateAwsConfig } from '../utils/validateEnv';

async function testAwsConnection() {
  try {

    validateAwsConfig();
    
 
    console.log('AWS Region:', process.env.NEXT_PUBLIC_AWS_REGION);
    console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...');
    console.log('AWS Table Name:', process.env.AWS_DYNAMODB_TABLE_NAME);
    

    const testUser: User = {
      id: 'test-123',
      email: 'test@example.com',
      password: 'hashedPassword',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        healthInfo: {
          allergies: ['none'],
          chronicConditions: ['none'],
          medications: ['none'],
          previousVaccines: [
            {
              name: 'COVID-19',
              date: '2023-01-01'
            }
          ],
          familyHistory: ['none']
        },
        lifestyle: {
          occupation: 'Developer',
          travelFrequency: 'rarely' as const,
          livingEnvironment: 'urban' as const
        },
        contact: {
          phone: '1234567890',
          address: 'Test Address',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: '0987654321'
          }
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };


    try {
      console.log('Creating user...');
      await DynamoDBService.createUser(testUser);
      console.log('User created successfully');
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }


    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      console.log('Fetching user...');
      const user = await DynamoDBService.getUserByEmail('test@example.com');
      if (!user) {
        throw new Error('User not found after creation');
      }
      console.log('Retrieved user:', JSON.stringify(user, null, 2));
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }

    try {
      console.log('Updating user...');
      await DynamoDBService.updateUser('test@example.com', {
        profile: {
          ...testUser.profile,
          firstName: 'Updated'
        }
      });
      console.log('User updated successfully');


      const updatedUser = await DynamoDBService.getUserByEmail('test@example.com');
      console.log('Updated user:', JSON.stringify(updatedUser, null, 2));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}


process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

testAwsConnection(); 