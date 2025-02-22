import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  QueryCommand,
  UpdateCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { awsConfig } from '../config/aws-config';
import type {UserItem, OAuthUserItem} from '../types/user';
import type { ChatSession, ChatMessage } from '../types/chat';
import { DynamoDB } from 'aws-sdk';
import { getNZDateTime } from '../utils/dateUtils';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    sessionToken: process.env.SESSION_TOKEN!,
  },
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient);

const dynamodb = new DynamoDB.DocumentClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || ''
  }
});

export class DynamoDBService {
  private static readonly tableName = 'vaccine-users';

  static async createUser(userData: any): Promise<UserItem> {
    const now = getNZDateTime();
    const userItem: UserItem = {
      PK: `USER#${userData.email}`,
      SK: `PROFILE#${userData.email}`,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      phone: userData.phone,
      address: userData.address,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: userItem,
    }));

    return userItem;
  }

  static async getUserByEmail(email: string): Promise<UserItem | null> {
    console.log('Attempting to get user with email:', email);
    
    const result = await docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${email}`,
        SK: `PROFILE#${email}`,
      },
    }));

    if (!result.Item) {
    
      const queryResult = await docClient.send(new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `USER#${email}`,
        },
      }));

      if (!queryResult.Items || queryResult.Items.length === 0) {
        return null;
      }

      result.Item = queryResult.Items[0];
    }

    const item = result.Item;
    if (item) {
      const userItem: UserItem = {
        PK: item.PK,
        SK: item.SK,
        email: item.email,
        password: item.password,
        firstName: item.firstName,
        lastName: item.lastName,
        dateOfBirth: item.dateOfBirth,
        gender: item.gender,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        phone: item.phone,
        address: item.address,
        role: item.role,
      };

      console.log('Converted user item:', userItem);
      return userItem;
    }

    return null;
  }

  static async updateUser(updates: Partial<UserItem>): Promise<UserItem> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    // 先处理用户提供的更新字段
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'PK' && key !== 'SK' && key !== 'email' && value !== undefined) {
        const attributeName = `#${key}`;
        const attributeValue = `:${key}`;
        updateExpressions.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeNames[attributeName] = key;
        expressionAttributeValues[attributeValue] = value;
      }
    });

    // 最后添加 updatedAt，避免重复
    if (!expressionAttributeNames['#updatedAt']) {
      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = getNZDateTime();
    }

    const params = {
      TableName: this.tableName,
      Key: {
        PK: updates.PK,
        SK: updates.SK,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await docClient.send(new UpdateCommand(params));
      return result.Attributes as UserItem;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async checkTable(): Promise<boolean> {
    try {
      const response = await dynamoClient.send(new DescribeTableCommand({
        TableName: this.tableName,
      }));
      console.log('Table details:', {
        TableName: response.Table?.TableName,
        ItemCount: response.Table?.ItemCount,
        TableStatus: response.Table?.TableStatus,
      });
      return true;
    } catch (error) {
      console.error('Error checking table:', error);
      return false;
    }
  }

  static async getChatSessions(userId: string): Promise<ChatSession[]> {
    const response = await docClient.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'CHAT#',
      },
    }));
    return response.Items as ChatSession[];
  }

  static async createChatSession(session: ChatSession): Promise<boolean> {
    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `USER#${session.userId}`,
        SK: `CHAT#${session.id}`,
        ...session,
      },
    }));
    return true;
  }

  static async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await docClient.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `CHAT#${sessionId}`,
        ':sk': 'MSG#',
      },
    }));
    return response.Items as ChatMessage[];
  }

  static async createChatMessage(message: ChatMessage): Promise<boolean> {
    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `CHAT#${message.sessionId}`,
        SK: `MSG#${message.id}`,
        ...message,
      },
    }));
    return true;
  }

  static async getAllUsers(): Promise<UserItem[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(PK, :pk) and (attribute_not_exists(#r) or #r <> :adminRole)',
        ExpressionAttributeValues: {
          ':pk': 'USER#',
          ':adminRole': 'admin'
        },
        ExpressionAttributeNames: {
          '#r': 'role'
        }
      }));

      return result.Items as UserItem[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async deleteUser(email: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${email}`,
          SK: `PROFILE#${email}`
        }
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getAllQuestions(): Promise<any[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: 'user-questions',
      }));

      return result.Items || [];
    } catch (error) {
      console.error('Error getting questions:', error);
      throw error;
    }
  }

  static async createOAuthUser(userData: Partial<OAuthUserItem>): Promise<OAuthUserItem> {
    const now = getNZDateTime();
    const userItem: OAuthUserItem = {
      PK: `USER#${userData.email}`,
      SK: `OAUTH#${userData.provider}`,
      email: userData.email!,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      gender: 'other',
      provider: userData.provider!,
      providerId: userData.providerId!,
      createdAt: now,
      updatedAt: now,
      dateOfBirth: '',
      phone: '',
      address: ''
    };

    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: userItem,
    }));

    return userItem;
  }

  static async getOAuthUser(email: string, provider: string): Promise<OAuthUserItem | null> {
    const result = await docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${email}`,
        SK: `OAUTH#${provider}`,
      },
    }));

    return result.Item as OAuthUserItem || null;
  }
} 