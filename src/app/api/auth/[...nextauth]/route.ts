import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import MicrosoftProvider from 'next-auth/providers/azure-ad';
import { NextAuthOptions } from 'next-auth';
import { DynamoDBService } from '@/services/dynamodb';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        try {
          // 检查用户是否存在
          let dbUser = await DynamoDBService.getUserByEmail(user.email!);
          
          if (!dbUser) {
            // 如果用户不存在，创建新用户
            const newUser = {
              email: user.email!,
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              password: '', // GitHub 用户不需要密码
              dateOfBirth: '',
              gender: 'other' as const,
              phone: '',
              address: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            await DynamoDBService.createUser(newUser);
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // 可以在这里添加额外的会话信息
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 