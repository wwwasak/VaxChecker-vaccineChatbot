'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';
import { StorageService } from '@/services/storage';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 页面加载时从本地存储获取用户信息
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      StorageService.setCurrentUser(newUser);
    } else {
      StorageService.clearCurrentUser();
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 