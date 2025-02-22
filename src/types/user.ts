export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
}
export interface UserItem {
  PK: string;        // 'USER#email'
  SK: string;        // 'PROFILE#email'
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  role?: 'user' | 'admin';  // 添加角色字段
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
}
export interface UserUpdateInput extends Partial<Omit<UserProfile, 'email' | 'createdAt'>> {
  // define updatable fields
}

// 新增第三方登录用户类型
export interface OAuthUserItem {
  PK: string;
  SK: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'other';
  provider: 'github' | 'google';  // 标识第三方登录提供商
  providerId: string;            // 第三方平台的用户ID
  createdAt: string;
  updatedAt: string;
  // 可选字段
  dateOfBirth?: string;
  phone?: string;
  address?: string;
} 