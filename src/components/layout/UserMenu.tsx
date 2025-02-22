'use client';

import { useRouter } from 'next/navigation';
import { StorageService } from '@/services/storage';

export function UserMenu() {
  const router = useRouter();

  const handleLogout = () => {
    StorageService.logout();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900"
    >
      Sign out
    </button>
  );
} 