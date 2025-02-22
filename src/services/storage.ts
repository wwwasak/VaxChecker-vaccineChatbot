import { User } from '@/types/user';

const USERS_KEY = 'vaccine_users';
const CURRENT_USER_KEY = 'vaccine_current_user';
const RESET_TOKENS_KEY = 'vaccine_reset_tokens';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天

export const StorageService = {
  // save user data
  saveUser: (user: User) => {
    if (typeof window === 'undefined') return false;
    
    try {
      // get existing user list
      const users = StorageService.getAllUsers();
      users.push(user);
      
      // save to localStorage
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  },

  // get all users
  getAllUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  // find user by email
  getUserByEmail: (email: string): User | null => {
    try {
      const users = StorageService.getAllUsers();
      return users.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  },

  // save reset token
  saveResetToken: (email: string, token: string, expires: Date) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
      tokens[token] = { email, expires: expires.toISOString() };
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
      return true;
    } catch (error) {
      console.error('Error saving reset token:', error);
      return false;
    }
  },

  // verify reset token
  verifyResetToken: (token: string) => {
    if (typeof window === 'undefined') return null;
    
    try {
      const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
      const tokenInfo = tokens[token];
      
      if (!tokenInfo) return null;
      
      const expires = new Date(tokenInfo.expires);
      if (expires < new Date()) {
        // token expired
        delete tokens[token];
        localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
        return null;
      }
      
      return tokenInfo;
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return null;
    }
  },

  // clear reset token
  clearResetToken: (token: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
      delete tokens[token];
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error clearing reset token:', error);
    }
  },

  // update user password
  updateUserPassword: (email: string, newPassword: string) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const users = StorageService.getAllUsers();
      const userIndex = users.findIndex(user => user.email === email);
      
      if (userIndex === -1) return false;
      
      users[userIndex].password = newPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  },

  // set current user (include remember login function)
  setCurrentUser: (user: User, remember: boolean = false) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const userData = {
        ...user,
        sessionExpires: new Date(
          Date.now() + (remember ? SESSION_DURATION : 24 * 60 * 60 * 1000)
        ).toISOString(),
      };
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error setting current user:', error);
      return false;
    }
  },

  // get current user (include session timeout check)
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(CURRENT_USER_KEY);
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      const sessionExpires = new Date(user.sessionExpires);
      
      if (sessionExpires < new Date()) {
        // session expired
        StorageService.clearCurrentUser();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // logout function
  logout: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      // can add other cleanup operations
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // clear current user (used when logging out)
  clearCurrentUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}; 