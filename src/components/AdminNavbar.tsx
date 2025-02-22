'use client';

import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const router = useRouter();

  const handleSignOut = () => {
    // 清除本地存储的用户信息
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // 重定向到登录页面
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 text-lg font-semibold">
                Admin Dashboard
              </span>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Administrator
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 