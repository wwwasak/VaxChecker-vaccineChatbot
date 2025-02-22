import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    sessionToken: process.env.SESSION_TOKEN!,
  },
});

async function testConnection() {
  try {
    // 测试表扫描
    const result = await client.scan({
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME || 'Users',
      Limit: 1
    }).promise();
    
    console.log('Successfully connected to DynamoDB');
    console.log('Sample data:', result.Items);
  } catch (error) {
    console.error('Failed to connect to DynamoDB:', error);
  }
}

testConnection(); 