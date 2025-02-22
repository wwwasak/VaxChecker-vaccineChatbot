export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    sessionToken: process.env.SESSION_TOKEN!,
  },
  dynamoDb: {
    tableName: process.env.AWS_DYNAMODB_TABLE_NAME || 'vaccine-users',
  }
}; 