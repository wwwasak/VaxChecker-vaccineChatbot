import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { DynamoDBService } from '../services/dynamodb';

async function cleanTestData() {
  try {
    const testEmail = 'test@example.com';
    await DynamoDBService.deleteUser(testEmail);
    console.log('Test data cleaned successfully');
  } catch (error) {
    console.error('Error cleaning test data:', error);
  }
}

cleanTestData(); 