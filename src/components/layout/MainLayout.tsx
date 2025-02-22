'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Vaccine Info Assistant
              </Link>
              
              <div className="ml-10 flex space-x-4">
                <Link href="/chat" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Chat
                </Link>
                <Link href="/news" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  News
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}; 