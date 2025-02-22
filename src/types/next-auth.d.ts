import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      email: string;
      name?: string;
    };
  }
  
  interface User {
    email: string;
    name?: string;
  }
} 